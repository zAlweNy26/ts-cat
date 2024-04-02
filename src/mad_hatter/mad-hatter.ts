import { existsSync, mkdir, readdirSync } from 'node:fs'
import { readFile, rm } from 'node:fs/promises'
import { basename, join, sep } from 'node:path'
import { execSync } from 'node:child_process'
import chokidar from 'chokidar'
import { catPaths } from '@utils'
import { getDb, updateDb } from '@db'
import { log } from '@logger'
import type { HookNames, HookTypes, Hooks } from './hook.ts'
import { Plugin } from './plugin.ts'
import type { Tool } from './tool.ts'
import type { Form } from './form.ts'

const { basePath, pluginsPath } = catPaths

export class MadHatter {
	private static instance: MadHatter
	private plugins = new Map<string, Plugin>()
	private activePlugins: Plugin['id'][] = []
	onPluginsSyncCallback?: () => void = undefined
	hooks: Partial<Hooks> = {}
	tools: Tool[] = []
	forms: Form[] = []

	private constructor() {}

	/**
	 * Get the Mad Hatter instance
	 * @returns The Mad Hatter class as a singleton
	 */
	static async getInstance() {
		if (!MadHatter.instance) {
			log.silent('Initializing the Mad Hatter...')
			MadHatter.instance = new MadHatter()
			MadHatter.instance.activePlugins = getDb().activePlugins
			await MadHatter.instance.installPlugin(`${basePath}/mad_hatter/core_plugin`)
			await MadHatter.instance.findPlugins()
		}
		return MadHatter.instance
	}

	/**
	 * Executes a hook method by name with the provided arguments.
	 * @param name The name of the hook to execute.
	 * @param args The arguments to pass to the hook function.
	 * @returns The result of executing the hook methods sequentially.
	 */
	executeHook<T extends HookNames = HookNames>(name: T, ...args: Parameters<HookTypes[T]>) {
		const hook = this.hooks[name]
		if (!hook || hook.length === 0) { throw new Error(`Hook "${name}" not found in any plugin`) }
		const timeStart = performance.now()
		let isFirst = true
		// TODO: Find a way to type these any properly
		const result = hook.reduce((acc, { fn }: { fn: any }) => {
			const res = isFirst ? fn(...acc) : fn(acc)
			isFirst = false
			return res
		}, args)
		const timeEnd = performance.now()
		const hookTime = (timeEnd - timeStart).toFixed(2)
		log.tag('bgGreenBright', 'HOOK', name, `executed in ${hookTime}ms`)
		return result as ReturnType<HookTypes[T]>
	}

	/**
	 * Gets the installed plugins.
	 */
	get installedPlugins() {
		return Array.from([...this.plugins.values()])
	}

	/**
	 * Finds and installs plugins present in the plugins path.
	 */
	async findPlugins() {
		log.silent('Finding plugins...')
		if (existsSync(pluginsPath)) {
			const dirs = readdirSync(pluginsPath, { withFileTypes: true })
			for (const dir of dirs) {
				if (dir.isDirectory()) {
					const pluginPath = join(pluginsPath, dir.name)
					await this.installPlugin(pluginPath)
				}
			}
		}
		else mkdir(pluginsPath, { recursive: true }, () => log.debug('Created plugins directory'))
		log.success('Active plugins:', this.activePlugins.join(', '))
		this.syncHooksAndProcedures()
		if (Object.keys(this.hooks).length > 0) {
			log.success('Added hooks:')
			log.table(Object.entries(this.hooks).map(([key, value]) =>
				({ 'Hook Name': key, 'Plugins': value.map(p => p.from).join(' | ') }),
			))
		}
		if (this.tools.length > 0) { log.success('Added tools:', this.tools.map(t => `"${t.name}"`).join(', ')) }
		if (this.forms.length > 0) { log.success('Added forms:', this.forms.map(f => `"${f.name}"`).join(', ')) }
	}

	/**
	 * Installs a plugin from the specified path.
	 * @param path The path to the plugin.
	 * @returns The installed plugin.
	 */
	async installPlugin(path: string) {
		const id = basename(path)
		let plugin = this.plugins.get(id)
		if (!plugin) {
			plugin = await Plugin.new(path)
			this.plugins.set(plugin.id, plugin)
			plugin.triggerEvent('installed')
		}
		if (this.activePlugins.includes(plugin.id)) { plugin.activate() }
		return plugin
	}

	/**
	 * Gets a plugin by its ID.
	 * @param id The ID of the plugin to get.
	 */
	getPlugin(id: string) {
		return this.plugins.get(id)
	}

	/**
	 * Removes a plugin by its ID.
	 * @param id The ID of the plugin to remove.
	 */
	async removePlugin(id: string) {
		const plugin = this.plugins.get(id)
		if (plugin) {
			plugin.triggerEvent('removed')
			const requirementsPath = join(plugin.path, 'requirements.txt')
			if (existsSync(requirementsPath)) {
				const requirements = await readFile(requirementsPath, 'utf-8')
				const pkgs = requirements.split('\n').map(req => req.trim().split('=')[0]).join(' ')
				try { execSync(`pnpm remove ${pkgs}`, { cwd: plugin.path }) }
				catch (error) { log.error(`Error removing requirements for ${plugin.id}: ${error}`) }
			}
			await rm(plugin.path, { recursive: true, force: true })
			this.activePlugins = this.activePlugins.filter(p => p !== id)
			this.plugins.delete(id)
			this.syncHooksAndProcedures()
			updateDb(db => db.activePlugins = this.activePlugins)
		}
	}

	/**
	 * Reloads a plugin by its ID.
	 * @param id The ID of the plugin to reload.
	 */
	async reloadPlugin(id: string) {
		const plugin = this.plugins.get(id)
		if (plugin && !plugin.reloading) {
			log.info(`Reloading plugin: ${plugin.id}`)
			await plugin.reload()
			this.syncHooksAndProcedures()
		}
	}

	/**
	 * Toggles a plugin's state and executes corresponding hooks.
	 * @param id The ID of the plugin to toggle.
	 * @param sync Whether to synchronize hooks and tools immediately. Default is true.
	 */
	togglePlugin(id: string, sync = true) {
		const plugin = this.plugins.get(id)
		if (plugin) {
			const active = this.activePlugins.includes(id)
			if (active) {
				plugin.deactivate()
				this.activePlugins = this.activePlugins.filter(p => p !== id)
			}
			else {
				plugin.activate()
				this.activePlugins.push(plugin.id)
			}
			updateDb(db => db.activePlugins = this.activePlugins)
			if (sync) { this.syncHooksAndProcedures() }
			return plugin.active
		}
		return false
	}

	/**
	 * Synchronizes hooks, tools and forms.
	 * It also sorts the hooks by priority.
	 */
	syncHooksAndProcedures() {
		log.silent('Synchronizing hooks, tools and forms...')
		this.tools = []
		this.forms = []
		this.hooks = {}
		this.plugins.forEach((plugin) => {
			if (this.activePlugins.includes(plugin.id)) {
				this.tools.push(...plugin.tools)
				this.forms.push(...plugin.forms)
				plugin.hooks.forEach((hook) => {
					const { name, ...rest } = hook
					if (!this.hooks[name]) { this.hooks[name] = [] }
					// TODO: Fix this type
					this.hooks[name]!.push({ ...(rest as any), from: plugin.id })
				})
			}
		})
		// Sort hooks by higher priority
		Object.entries(this.hooks).forEach(([name, hooks]) => {
			// TODO: Fix this type
			this.hooks[name as HookNames] = hooks.sort((a, b) => b.priority - a.priority) as any
		})
		this.onPluginsSyncCallback?.()
	}
}

export const madHatter = await MadHatter.getInstance()

chokidar.watch('src/plugins', {
	ignored: ['**/settings.json', '**/tmp_*.ts'],
	ignoreInitial: true,
	persistent: true,
}).on('all', async (event, path) => {
	const index = path.indexOf('src/plugins')
	const id = path.substring(index).split(sep)[2] ?? ''
	const hasDir = index >= 0 && index + id.length < path.length
	if (id) {
		const plugin = madHatter.getPlugin(id)
		if (!plugin && event === 'addDir') { await madHatter.installPlugin(path) }
		else if (plugin && event === 'unlinkDir' && !hasDir) { await madHatter.removePlugin(id) }
		else if (plugin && event !== 'addDir') { await madHatter.reloadPlugin(id) }
	}
})
