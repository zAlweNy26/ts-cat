import type { Form } from './form.ts'
import type { HookNames, Hooks, HookTypes } from './hook.ts'
import type { Tool } from './tool.ts'
import { mkdir, readdir } from 'node:fs/promises'
import { basename, join, sep } from 'node:path'
import { db } from '@db'
import { log } from '@logger'
import { catPaths, existsDir } from '@utils'
import chokidar from 'chokidar'
import { Plugin } from './plugin.ts'

const { basePath, pluginsPath } = catPaths

export class MadHatter {
	private static instance: MadHatter
	private plugins = new Map<string, Plugin>()
	private activePlugins: Set<string> = new Set(['core_plugin'])
	onPluginsSyncCallback?: () => Promise<void> = undefined
	hooks: Partial<Hooks> = {}
	tools: Tool[] = []
	forms: Form[] = []

	private constructor() {
		log.silent('Initializing the Mad Hatter...')
		this.activePlugins = new Set([...this.activePlugins, ...db.data.activePlugins])
	}

	/**
	 * Get the Mad Hatter instance
	 * @returns The Mad Hatter class as a singleton
	 */
	static async getInstance() {
		if (!MadHatter.instance) {
			MadHatter.instance = new MadHatter()
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
	async executeHook<T extends HookNames = HookNames>(name: T, ...args: Parameters<HookTypes[T]>) {
		const hook = this.hooks[name]
		if (!hook || hook.length === 0) throw new Error(`Hook "${name}" not found in any plugin`)
		const timeStart = performance.now()
		// First argument is the pipeable one
		let teaCup = args[0]
		for (const h of hook) {
			const teaSpoon = await (h.fn as (...args: any[]) => any)(teaCup, ...args.slice(1))
			teaCup = teaSpoon || teaCup
		}
		const timeEnd = performance.now()
		const hookTime = (timeEnd - timeStart).toFixed(2)
		log.tag('bgGreenBright', 'HOOK', name, `executed in ${hookTime}ms`)
		return teaCup as Awaited<ReturnType<HookTypes[T]>>
	}

	/**
	 * Gets a copy of the installed plugins.
	 */
	get installedPlugins() {
		return [...this.plugins.values().map(p => p.info)]
	}

	/**
	 * Finds and installs plugins present in the plugins path.
	 */
	async findPlugins() {
		log.silent('Finding plugins...')
		if (await existsDir(pluginsPath)) {
			const dirs = await readdir(pluginsPath, { withFileTypes: true })
			for (const dir of dirs) {
				if (dir.isDirectory()) {
					const pluginPath = join(pluginsPath, dir.name)
					await this.installPlugin(pluginPath)
				}
			}
		}
		else {
			try {
				await mkdir(pluginsPath, { recursive: true })
				log.debug('Created plugins directory')
			}
			catch (error) {
				log.error('Error creating plugins directory:', error)
			}
		}
		log.success('Active plugins:', [...this.activePlugins].join(', '))
		await this.syncHooksAndProcedures()
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
		plugin.active = this.activePlugins.has(plugin.id)
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
			log.debug(`Removing plugin: ${id}`)
			await plugin.remove()
			this.activePlugins.delete(id)
			db.update(db => db.activePlugins = this.activePlugins)
			this.plugins.delete(id)
			await this.syncHooksAndProcedures()
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
			await this.syncHooksAndProcedures()
		}
	}

	/**
	 * Toggles a plugin's state and executes corresponding hooks.
	 * @param id The ID of the plugin to toggle.
	 * @param state The state to set the plugin to. Default is undefined.
	 * @param sync Whether to synchronize hooks and tools immediately. Default is true.
	 */
	async togglePlugin(id: string, state?: boolean, sync = true) {
		const plugin = this.plugins.get(id)
		if (!plugin) {
			log.error(`Plugin ${id} not found`)
			return false
		}
		if (plugin.active !== state) {
			plugin.active = state ?? !plugin.active
			if (plugin.active) this.activePlugins.add(plugin.id)
			else this.activePlugins.delete(plugin.id)
			db.update(db => db.activePlugins = this.activePlugins)
			if (sync) await this.syncHooksAndProcedures()
		}
		else log.info(`Plugin ${id} is already ${state ? 'enabled' : 'disabled'}`)
		return plugin.active
	}

	/**
	 * Synchronizes hooks, tools and forms.
	 * It also sorts the hooks by priority.
	 */
	async syncHooksAndProcedures() {
		log.silent('Synchronizing hooks, tools and forms...')
		this.tools = []
		this.forms = []
		this.hooks = {}
		this.plugins.forEach((plugin) => {
			if (this.activePlugins.has(plugin.id)) {
				plugin.tools.forEach(tool => tool.active = db.data.activeTools.has(tool.name))
				plugin.forms.forEach(form => form.active = db.data.activeForms.has(form.name))
				this.tools.push(...plugin.tools)
				this.forms.push(...plugin.forms)
				plugin.hooks.forEach((hook) => {
					const { name } = hook
					if (!this.hooks[name]) this.hooks[name] = []
					this.hooks[name]!.push(hook)
				})
			}
		})
		// Sort hooks by higher priority
		Object.entries(this.hooks).forEach(([name, hooks]) => {
			this.hooks[name as HookNames] = hooks.sort((a, b) => b.priority - a.priority)
		})
		if (Object.keys(this.hooks).length > 0) {
			log.success('Added hooks:')
			log.table(Object.entries(this.hooks).map(([key, value]) =>
				({ 'Hook Name': key, 'Plugins': value.map(p => p.from).join(' | ') }),
			))
		}
		if (this.tools.length > 0) log.success('Added tools:', this.tools.map(t => `"${t.name}"`).join(', '))
		if (this.forms.length > 0) log.success('Added forms:', this.forms.map(f => `"${f.name}"`).join(', '))
		await this.onPluginsSyncCallback?.()
	}
}

export const madHatter = await MadHatter.getInstance()

chokidar.watch('src/plugins', {
	ignored: path => path.endsWith('settings.json'),
	ignoreInitial: true,
	persistent: true,
}).on('all', async (event, path) => {
	const index = path.indexOf('src/plugins')
	const id = path.substring(index).split(sep)[2] ?? ''
	const hasDir = index >= 0 && index + id.length < path.length
	if (id) {
		const plugin = madHatter.getPlugin(id)
		if (!plugin && event === 'addDir') await madHatter.installPlugin(path)
		else if (plugin && event === 'unlinkDir' && !hasDir) await madHatter.removePlugin(id)
		else if (plugin && event !== 'addDir') await madHatter.reloadPlugin(id)
	}
})
