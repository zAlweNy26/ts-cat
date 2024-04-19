import { basename, dirname, extname, join, relative } from 'node:path'
import type { Dirent } from 'node:fs'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { readFile, unlink, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { execSync } from 'node:child_process'
import { defu } from 'defu'
import { z } from 'zod'
import { destr } from 'destr'
import { generateRandomString, getFilesRecursively, getZodDefaults } from '@utils'
import { log } from '@logger'
import { type Hook, isHook } from './hook.ts'
import { type Tool, isTool } from './tool.ts'
import { type Form, isForm } from './form.ts'
import { pluginManifestSchema } from '@/context.ts'

export type PluginManifest = z.infer<typeof pluginManifestSchema>

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
	settings: <T extends Record<string, z.ZodType>>(schema: T) => z.object(schema),
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
	private _manifest = getZodDefaults(pluginManifestSchema) as PluginManifest
	private _id: string
	private _reloading = false
	private _active = false
	private _hooks: Hook[] = []
	private _tools: Tool[] = []
	private _forms: Form[] = []

	private constructor(public path: string) {
		if (!existsSync(path)) log.error(new Error('Plugin path does not exist'))

		const stats = statSync(path)
		if (!stats.isDirectory()) log.error(new Error('Plugin path must be a directory'))

		this._id = basename(path)
	}

	static async new(path: string) {
		const plugin = new Plugin(path)
		await plugin.reload()
		return plugin
	}

	async reload() {
		const tsFiles = getFilesRecursively(this.path).filter(file => extname(file.name) === '.ts')
		if (tsFiles.length === 0) log.error(new Error('Plugin must contain at least one .ts file'))

		if (this._reloading) return

		this._reloading = true
		await this.installRequirements()
		await this.importAll(tsFiles)
		this.loadManifest()
		this.loadSettings()
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

	get settings() {
		return this._settings
	}

	set settings(settings: Record<string, any>) {
		this._settings = this.schema.parse(settings) as S
		const settingsPath = join(this.path, 'settings.json')
		writeFile(settingsPath, JSON.stringify(this._settings, null, 2))
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

	private loadManifest() {
		log.debug('Loading plugin manifest...')
		const manifestPath = join(this.path, 'plugin.json')
		if (existsSync(manifestPath)) {
			try {
				const json = destr<PluginManifest>(readFileSync(manifestPath, 'utf-8'))
				this._manifest = pluginManifestSchema.parse(defu(json, getZodDefaults(pluginManifestSchema)))
			}
			catch (err) {
				let msg = `Error reading plugin.json for ${this.id}`
				if (err instanceof z.ZodError) msg += `\n${err.errors.map(e => `${e.path.join('.')} : ${e.message}`).join('\n')}`
				log.error(msg)
			}
		}
	}

	private loadSettings() {
		log.debug('Loading plugin settings...')
		const settingsPath = join(this.path, 'settings.json')
		if (existsSync(settingsPath)) {
			try {
				const json = destr<Record<string, any>>(readFileSync(settingsPath, 'utf-8'))
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
			const requirements = await readFile(requirementsPath, 'utf-8')
			const names = requirements.split('\n').map(req => req.trim().split('@')[0]!)
			try {
				execSync(`npm list ${names.join(' ')}`, { cwd: this.path }).toString()
			}
			catch (error) {
				const pkgs = requirements.split('\n').join(' ')
				try { execSync(`pnpm i ${pkgs}`, { cwd: this.path }) }
				catch (error) { log.error(`Error installing requirements for ${this.id}: ${error}`) }
			}
		}
	}

	private async importAll(files: Dirent[]) {
		log.debug(`Importing plugin features...`)
		for (const file of files) {
			const normalizedPath = relative(process.cwd(), file.path)
			const content = await readFile(normalizedPath, 'utf-8')
			const tmpFile = join(dirname(normalizedPath), `tmp_${generateRandomString(10)}.ts`)
			const replaced = content.replace(/^(const|let)?(\s.*=.*)?Cat(Hook|Tool|Form|Plugin)\.(add|on|settings).*/gm, (match) => {
				const id = generateRandomString(10)
				const isVar = match.startsWith('const') || match.startsWith('let')
				return `export ${isVar ? match : `const ${id} = ${match}`}`
			})
			try {
				await writeFile(tmpFile, replaced)
				const exported = await import(pathToFileURL(tmpFile).href)
				Object.values(exported).forEach((v) => {
					if (v instanceof z.ZodObject) this._schema = v
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
				await unlink(tmpFile)
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
