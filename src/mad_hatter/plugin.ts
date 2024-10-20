import type { Dirent } from 'node:fs'
import { rm } from 'node:fs/promises'
import { basename, extname, join, relative } from 'node:path'
import { log } from '@logger'
import { deepDefaults, existsDir, getFilesRecursively, getRandomString, getZodDefaults } from '@utils'
import { destr } from 'destr'
import { diffLines } from 'diff'
import _CloneDeep from 'lodash/cloneDeep.js'
import { titleCase } from 'scule'
import { z } from 'zod'
import { type Form, isForm } from './form.ts'
import { type Hook, isHook } from './hook.ts'
import { isTool, type Tool } from './tool.ts'

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
	on: <T extends EventNames>(event: T, fn: PluginEvents[T]): PluginEvent<T> => ({ name: event, fn }),
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
	#oldRequirements = ''
	#hooks: Hook[] = []
	#fileUrls: string[] = []
	tools: Tool[] = []
	forms: Form[] = []

	private constructor(public path: string) {
		this._id = basename(path)
		this._manifest = deepDefaults(getZodDefaults(pluginManifestSchema), { name: titleCase(this._id) }) as PluginManifest
	}

	static async new(path: string) {
		if (!(await existsDir(path))) throw new Error('Plugin path does not exist')

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

	set active(active: boolean) {
		this._active = active
		if (active) this.triggerEvent('enabled')
		else this.triggerEvent('disabled')
	}

	get manifest() {
		return this._manifest
	}

	get hooks() {
		return _CloneDeep(this.#hooks)
	}

	get info() {
		return {
			id: this.id,
			active: this.active,
			manifest: this.manifest,
			upgradable: false, // TODO: Add registry support for upgrading
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

	set settings(settings: S) {
		this._settings = this.schema.parse(settings) as S
		const settingsPath = join(this.path, 'settings.json')
		Bun.write(settingsPath, JSON.stringify(this._settings, null, 2))
	}

	/**
	 * Triggers the specified event.
	 * @param event The name of the event to trigger.
	 */
	triggerEvent(event: EventNames) {
		const callback = this.events[event] as (value: Record<string, any>) => void
		if (callback) {
			const timeStart = performance.now()
			if (event === 'installed' || event === 'removed') callback(this.manifest)
			else if (event === 'enabled' || event === 'disabled') callback(this.settings)
			const timeEnd = performance.now()
			const eventTime = (timeEnd - timeStart).toFixed(2)
			log.tag('bgCyanBright', 'PLUGIN', event, `event of ${this.id} executed in ${eventTime}ms`)
		}
		else log.debug(`Plugin ${this.id} ${event}`)
	}

	private async loadManifest() {
		log.debug('Loading plugin manifest...')
		const file = Bun.file(join(this.path, 'plugin.json'))
		if (await file.exists()) {
			try {
				const json = destr<PluginManifest>(await file.text())
				this._manifest = pluginManifestSchema.parse(deepDefaults(json, getZodDefaults(pluginManifestSchema), { name: titleCase(this.id) }))
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
		const file = Bun.file(join(this.path, 'settings.json'))
		if (await file.exists()) {
			try {
				const json = destr(await file.text())
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
		const file = Bun.file(join(this.path, 'requirements.txt'))
		if (await file.exists()) {
			const newRequirements = await file.text()
			const differences = diffLines(this.#oldRequirements, newRequirements)
			const newPkgs = differences.filter(d => d.added).map(d => d.value.trim())
			const oldPkgs = differences.filter(d => d.removed).map(d => d.value.trim().split('@')[0]).filter(p => p !== undefined)
			this.#oldRequirements = newRequirements
			try { Bun.spawnSync(['bun', 'remove', ...oldPkgs]) }
			catch (error) { log.error(`Error uninstalling requirements for ${this.id}: ${error}`) }
			try { Bun.spawnSync(['bun', 'i', ...newPkgs]) }
			catch (error) { log.error(`Error installing requirements for ${this.id}: ${error}`) }
		}
	}

	private async importAll(files: Dirent[]) {
		log.debug(`Importing plugin features...`)
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
					else if (isForm(v)) this.forms.push(v)
					else if (isTool(v)) this.tools.push(v)
					else if (isHook(v)) this.#hooks.push({ ...v, from: this.id })
					else if (isPluginEvent(v)) this.events[v.name] = v.fn as any
				})
			}
			catch (error) {
				log.error('Error importing plugin:', error)
			}
			finally {
				this.#fileUrls.push(moduleUrl)
			}
		}
	}

	/**
	 * Asynchronously removes the current plugin.
	 * This method performs the following actions:
	 * 1. Triggers the 'removed' event.
	 * 2. Revokes all object URLs stored.
	 * 3. If `requirements.txt` exists, attempts to remove the packages.
	 * 4. Deletes the plugin's directory and its contents.
	 */
	async remove() {
		this.triggerEvent('removed')
		this.#fileUrls.forEach(u => URL.revokeObjectURL(u))
		const file = Bun.file(join(this.path, 'requirements.txt'))
		if (await file.exists()) {
			const requirements = await file.text()
			const pkgs = requirements.split('\n').map(req => req.trim().split('@')[0]).filter(p => p !== undefined)
			try { Bun.spawnSync(['bun', 'remove', ...pkgs]) }
			catch (error) { log.error(`Error uninstalling requirements for ${this.id}: ${error}`) }
		}
		await rm(this.path, { recursive: true, force: true })
	}
}
