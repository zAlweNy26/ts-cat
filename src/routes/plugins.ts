import { mkdir, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { pluginInfo, pluginSettings, serverContext, swaggerTags } from '@/context'
import { Elysia, t } from 'elysia'
import { zodToJsonSchema } from 'zod-to-json-schema'

export const pluginsRoutes = new Elysia({
	name: 'plugins',
	prefix: '/plugins',
	detail: { tags: [swaggerTags.plugins.name] },
}).use(serverContext).get('/', ({ mh }) => {
	const ps = mh.installedPlugins.map(({ info }) => info)
	return {
		installed: ps,
		registry: [],
	}
}, {
	detail: {
		description: 'Get list of available plugins.',
		summary: 'Get plugins',
	},
	response: {
		200: t.Object({
			installed: t.Array(t.Ref(pluginInfo)),
			registry: t.Array(t.Ref(pluginInfo)),
		}),
	},
}).get('/:pluginId', ({ mh, params, HttpError }) => {
	const id = params.pluginId
	const p = mh.getPlugin(id)
	if (!p) throw HttpError.NotFound('Plugin not found')
	return p.info
}, {
	detail: {
		description: 'Returns information on a single plugin.',
		summary: 'Get plugin details',
	},
	params: t.Object({ pluginId: t.String() }),
	response: {
		200: 'pluginInfo',
		404: 'error',
	},
}).delete('/:pluginId', async ({ mh, params, log, HttpError }) => {
	const id = params.pluginId
	const p = mh.getPlugin(id)
	if (!p) throw HttpError.NotFound('Plugin not found')
	if (p.id === 'core_plugin') throw HttpError.InternalServer('Cannot delete core_plugin')
	try {
		await mh.removePlugin(id)
	}
	catch (error) {
		log.error(error)
		throw HttpError.InternalServer('Unable to remove the plugin')
	}
}, {
	detail: {
		description: 'Totally removes the specified plugin.',
		summary: 'Delete plugin',
	},
	params: t.Object({ pluginId: t.String() }),
	response: {
		204: t.Void(),
		404: 'error',
		400: 'error',
	},
}).post('/upload', async ({ body, log, mh, HttpError }) => {
	const { file } = body
	const allowedTypes = ['application/zip', 'application/x-zip-compressed', 'application/x-tar', 'application/x-gzip', 'application/x-bzip2']
	if (!allowedTypes.includes(file.type)) throw HttpError.BadRequest('Invalid file type. It must be one of the following: zip, tar, gzip, bzip2')
	log.info(`Uploading plugin ${file.type}`)

	const extractDir = join(tmpdir(), 'ccat-plugin-extract')
	await mkdir(extractDir, { recursive: true })
	const tempFilePath = join(extractDir, file.name)

	if (basename(tempFilePath) === 'core_plugin') throw HttpError.InternalServer('Cannot install a plugin with same id as core_plugin')

	const decompressed = Bun.gunzipSync(await file.arrayBuffer())
	await Bun.write(tempFilePath, decompressed)
	const files = await readdir(tempFilePath)
	const tsFiles = files.filter(f => f.endsWith('.ts'))
	if (tsFiles.length === 0) {
		log.error('No .ts files found in the extracted plugin folder')
		throw HttpError.InternalServer('No .ts files found in the extracted plugin folder')
	}
	try {
		const plugin = await mh.installPlugin(tempFilePath)
		await mh.togglePlugin(plugin.id)
	}
	catch (error) {
		log.warn(error)
	}

	return {
		info: 'Plugin is being installed asynchronously',
	}
}, {
	detail: {
		description: 'Install a new plugin from a zip file.',
		summary: 'Install plugin',
	},
	body: t.Object({
		file: t.File(),
	}),
	query: t.Object({
		async: t.Boolean({ default: true }),
	}),
	response: {
		200: t.Object({ info: t.String() }),
		400: 'error',
		500: 'error',
	},
}).post('/upload/registry', async ({ body, log }) => {
	const { url } = body
	log.info(`Installing plugin from registry: ${url}`)
	// TODO: Add registry support
	return {
		info: 'Plugin is being installed asynchronously',
	}
}, {
	detail: {
		description: 'Install a new plugin from the registry.',
		summary: 'Install plugin from registry',
	},
	body: t.Object({
		url: t.String({ format: 'uri' }),
	}),
	query: t.Object({
		async: t.Boolean({ default: true }),
	}),
	response: {
		200: t.Object({ info: t.String() }),
		400: 'error',
	},
}).patch('/toggle/:pluginId', async ({ body, params, mh, HttpError }) => {
	const id = params.pluginId
	if (id === 'core_plugin') throw HttpError.InternalServer('Cannot toggle core_plugin')
	const p = mh.getPlugin(id)
	if (!p) throw HttpError.NotFound('Plugin not found')
	const { active } = body
	if (active) await mh.togglePlugin(id)
	return {
		active: p.active,
	}
}, {
	detail: {
		description: 'Enable or disable a single plugin.',
		summary: 'Toggle plugin',
	},
	params: t.Object({ pluginId: t.String() }),
	body: t.Object({ active: t.Boolean() }),
	response: {
		200: t.Object({ active: t.Boolean() }),
		404: 'error',
		400: 'error',
	},
}).patch('/toggle/:pluginId/procedure/:procedureName', async ({ params, mh, db, HttpError }) => {
	const { pluginId, procedureName } = params
	const p = mh.getPlugin(pluginId)
	if (!p) throw HttpError.NotFound('Plugin not found')
	const tool = p.tools.find(t => t.name === procedureName)
	const form = p.forms.find(f => f.name === procedureName)
	if (!tool && !form) throw HttpError.NotFound('Procedure not found')
	if (tool) tool.active = !tool.active
	if (form) form.active = !form.active
	db.update((db) => {
		if (tool) {
			if (tool.active) db.activeTools.push(procedureName)
			else db.activeTools = db.activeTools.filter(t => t !== procedureName)
		}
		else if (form) {
			if (form.active) db.activeForms.push(procedureName)
			else db.activeForms = db.activeForms.filter(f => f !== procedureName)
		}
	})
	return {
		active: (tool?.active ?? form?.active) ?? false,
	}
}, {
	detail: {
		description: 'Enable or disable a single procedure of a plugin.',
		summary: 'Toggle plugin procedure',
	},
	params: t.Object({
		pluginId: t.String(),
		procedureName: t.String(),
	}),
	response: {
		200: t.Object({ active: t.Boolean() }),
		404: 'error',
		400: 'error',
	},
}).get('/settings', ({ mh }) => {
	const ps = mh.installedPlugins.map(p => ({
		name: p.id,
		value: p.settings,
		schema: zodToJsonSchema(p.schema),
	}))
	return {
		settings: ps,
	}
}, {
	detail: {
		description: 'Returns the settings of all the plugins.',
		summary: 'Get plugins settings',
	},
	response: {
		200: t.Object({
			settings: t.Array(t.Ref(pluginSettings)),
		}),
	},
}).get('/settings/:pluginId', ({ mh, params, HttpError }) => {
	const id = params.pluginId
	const p = mh.getPlugin(id)
	if (!p) throw HttpError.NotFound('Plugin not found')
	return {
		name: id,
		schema: zodToJsonSchema(p.schema),
		value: p.settings,
	}
}, {
	detail: {
		description: 'Returns the settings of the specified plugin.',
		summary: 'Get plugin settings',
	},
	params: t.Object({ pluginId: t.String() }),
	response: {
		200: 'pluginSettings',
		404: 'error',
	},
}).put('/settings/:pluginId', ({ body, params, mh, HttpError }) => {
	const id = params.pluginId
	const p = mh.getPlugin(id)
	if (!p) throw HttpError.NotFound('Plugin not found')
	const parsed = p.schema.safeParse(body)
	if (!parsed.success) throw HttpError.InternalServer(parsed.error.errors.map(e => e.message).join())
	p.settings = parsed.data
	return {
		name: id,
		value: parsed.data,
	}
}, {
	detail: {
		description: 'Updates the settings of the specified plugin.',
		summary: 'Update plugin settings',
	},
	params: t.Object({ pluginId: t.String() }),
	body: t.Record(t.String(), t.Any()),
	response: {
		200: 'customSetting',
		404: 'error',
		400: 'error',
	},
})
