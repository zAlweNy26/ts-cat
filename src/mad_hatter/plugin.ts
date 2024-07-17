import { basename, extname, join, relative } from 'node:path'
import type { Dirent } from 'node:fs'
import { existsSync, statSync } from 'node:fs'
import { defu } from 'defu'
import { z } from 'zod'
import { destr } from 'destr'
import { titleCase } from 'scule'
import { getFilesRecursively, getRandomString, getZodDefaults } from '@utils'
import { log } from '@logger'
import { type Hook, isHook } from './hook.ts'
import { type Tool, isTool } from './tool.ts'
import { type Form, isForm } from './form.ts'
import pkg from '~/package.json'

const pluginManifestSchema = z.object({
	name: z.string().min(1).trim(),
	version: z.string().trim().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/).default('0.0.1'),
	description: z.string().min(1).trim().default('No description provided'),
	authorName: z.string().min(1).trim().default('Anonymous'),
	authorUrl: z.string().trim().url().optional(),
	pluginUrl: z.string().trim().url().optional(),
	thumb: z.string().trim().url().optional(),
	tags: z.array(z.string().trim()).default(['miscellaneous', 'unknown']),
})

const transpiler = new Bun.Transpiler({ loader: 'ts' })

type PluginManifest = z.infer<typeof pluginManifestSchema>

interface PluginEvents {
	installed: (manifest: PluginManifest) => void
	enabled: (settings: Record<string, any>) => void
	disabled: (settings: Record<string, any>) => void
	removed: (manifest: PluginManifest) => void
}

type EventNames = keyof PluginEvents

interface PluginEvent<T extends EventNames = EventNames> {
	name: T
	fn: PluginEvents[T]
}

function isPluginEvent(event: any): event is PluginEvent {
	return event && typeof event == 'object' && 'name' in event && 'fn' in event
		&& typeof event.name == 'string' && typeof event.fn == 'function' && Object.keys(event).length === 2
		&& ['installed', 'enabled', 'disabled', 'removed'].includes(event.name)
}

export const CatPlugin = Object.freeze({
	/**
	 * Add some settings to the plugin
	 * @param schema the settings schema to use
	 * @returns the settings object
	 */
	settings: <T extends Record<string, z.ZodType>>(schema: T) => z.object(schema).describe('Plugin settings'),
	/**
	 * Add an event to the plugin
	 * @param event The name of the event to listen to. It can be `installed`, `enabled`, `disabled` or `removed`.
	 * @param fn The function to execute when the event is triggered.
	 * @returns the event instance
	 */
	on: <T extends EventNames>(event: T, fn: PluginEvents[T]) => ({ name: event, fn } as PluginEvent<T>),
})

export class Plugin<
	T extends Record<string, z.ZodType> = Record<string, z.ZodType>,
	S extends z.infer<z.ZodObject<T>> = z.infer<z.ZodObject<T>>,
> {
	private events: Partial<PluginEvents> = {}
	private _schema: z.ZodObject<T> = z.object({}) as z.ZodObject<T>
	private _settings: S = {} as S
	private _manifest: PluginManifest
	private _id: string
	private _reloading = false
	private _active = false
	private _hooks: Hook[] = []
	private _tools: Tool[] = []
	private _forms: Form[] = []
	private _fileUrls: string[] = []

	private constructor(public path: string) {
		if (!existsSync(path)) log.error(new Error('Plugin path does not exist'))

		const stats = statSync(path)
		if (!stats.isDirectory()) log.error(new Error('Plugin path must be a directory'))

		this._id = basename(path)
		this._manifest = defu(getZodDefaults(pluginManifestSchema), { name: titleCase(this._id) }) as PluginManifest
	}

	static async new(path: string) {
		const plugin = new Plugin(path)
		await plugin.reload()
		return plugin
	}

	async reload() {
		const tsFiles = (await getFilesRecursively(this.path)).filter(file => extname(file.name) === '.ts')
		if (tsFiles.length === 0) log.error(new Error('Plugin must contain at least one .ts file'))

		if (this._reloading) return

		this._reloading = true
		await this.installRequirements()
		await this.importAll(tsFiles)
		await this.loadManifest()
		await this.loadSettings()
		this._reloading = false
	}

	get reloading() {
		return this._reloading
	}

	get id() {
		return this._id
	}

	get active() {
		return this._active
	}

	get manifest() {
		return this._manifest
	}

	get hooks() {
		return [...this._hooks]
	}

	get tools() {
		return [...this._tools]
	}

	get forms() {
		return [...this._forms]
	}

	get info() {
		return {
			id: this.id,
			active: this.active,
			manifest: this.manifest,
			upgradable: false,
			forms: this.forms.map(({ name, description, active }) => ({ name, description, active })),
			tools: this.tools.map(({ name, description, active }) => ({ name, description, active })),
			hooks: this.hooks.map(({ name, priority }) => ({ name, priority })),
		}
	}

	get schema() {
		return this._schema
	}

	get fileUrls() {
		return [...this._fileUrls]
	}

	get settings() {
		return this._settings
	}

	set settings(settings: Record<string, any>) {
		this._settings = this.schema.parse(settings) as S
		const settingsPath = join(this.path, 'settings.json')
		Bun.write(settingsPath, JSON.stringify(this._settings, null, 2))
	}

	/**
	 * Triggers the specified event.
	 * @param event The name of the event to trigger.
	 */
	triggerEvent(event: EventNames) {
		const callback = this.events[event]
		if (callback) {
			const timeStart = performance.now()
			// TODO: Improve this check
			event === 'installed' || event === 'removed' ? callback(this.manifest) : callback(this.settings as any)
			const timeEnd = performance.now()
			const eventTime = (timeEnd - timeStart).toFixed(2)
			log.tag('bgCyanBright', 'PLUGIN', event, `event of ${this.id} executed in ${eventTime}ms`)
		}
		else log.info(`Plugin ${this.id} ${event}`)
	}

	private async loadManifest() {
		log.debug('Loading plugin manifest...')
		const manifestPath = join(this.path, 'plugin.json')
		if (existsSync(manifestPath)) {
			try {
				const json = destr<PluginManifest>(await Bun.file(manifestPath).text())
				this._manifest = pluginManifestSchema.parse(defu(json, getZodDefaults(pluginManifestSchema), { name: titleCase(this.id) }))
			}
			catch (err) {
				let msg = `Error reading plugin.json for ${this.id}`
				if (err instanceof z.ZodError) msg += `\n${err.errors.map(e => `${e.path.join('.')} : ${e.message}`).join('\n')}`
				log.error(msg)
			}
		}
	}

	private async loadSettings() {
		log.debug('Loading plugin settings...')
		const settingsPath = join(this.path, 'settings.json')
		if (existsSync(settingsPath)) {
			try {
				const json = destr<Record<string, any>>(await Bun.file(settingsPath).text())
				this._settings = this.schema.parse(json) as S
			}
			catch (err) {
				let msg = `Error reading settings.json for ${this.id}`
				if (err instanceof z.ZodError) msg += `\n${err.errors.map(e => `${e.path.join('.')} : ${e.message}`).join('\n')}`
				log.error(msg)
			}
		}
		else if (Object.keys(this.schema.shape).length > 0) this.settings = getZodDefaults(this.schema) as S
	}

	private async installRequirements() {
		log.debug('Installing plugin requirements...')
		const requirementsPath = join(this.path, 'requirements.txt')
		if (existsSync(requirementsPath)) {
			const requirements = await Bun.file(requirementsPath).text()
			const pkgs = requirements.split('\n')
			if (!Object.keys(pkg.dependencies).every(dep => pkgs.includes(dep))) {
				try { Bun.spawnSync(['bun', 'i', ...pkgs]) }
				catch (error) { log.error(`Error installing requirements for ${this.id}: ${error}`) }
			}
		}
	}

	private async importAll(files: Dirent[]) {
		log.debug(`Importing plugin features...`)
		// TODO: Improve plugin methods import (maybe with the Function class (?), ECMAScript parser or AST parser)
		for (const file of files) {
			const normalizedPath = relative(process.cwd(), file.path)
			const content = await Bun.file(normalizedPath).text()
			const replaced = content.replace(/^Cat(Hook|Tool|Form|Plugin)\.(add|on|settings).*/gm, (match) => {
				if (match.startsWith('export')) return match
				else if (match.startsWith('const') || match.startsWith('let')) return `export ${match}`
				else return `export const ${getRandomString(8)} = ${match}`
			})
			const jsCode = transpiler.transformSync(replaced)
			const blob = new Blob([`// ID: ${this.id}\n${jsCode}`], { type: 'application/javascript' })
			const moduleUrl = URL.createObjectURL(blob)
			try {
				const exported = await import(moduleUrl)
				Object.values(exported).forEach((v) => {
					if (v instanceof z.ZodObject && v.description === 'Plugin settings') this._schema = v
					else if (isForm(v)) this._forms.push(v)
					else if (isTool(v)) this._tools.push(v)
					else if (isHook(v)) this._hooks.push({ ...v, from: this.id })
					else if (isPluginEvent(v)) this.events[v.name] = v.fn as any
				})
			}
			catch (error) {
				log.error('Error importing plugin:', error)
			}
			finally {
				this._fileUrls.push(moduleUrl)
			}
		}
	}

	/**
	 * Activates the plugin.
	 */
	activate() {
		this._active = true
		this.triggerEvent('enabled')
	}

	/**
	 * Deactivates the plugin.
	 */
	deactivate() {
		this._active = false
		this.triggerEvent('disabled')
	}
}
