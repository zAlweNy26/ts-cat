import { mkdir, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { serverContext, swaggerTags } from '@/context'
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
		200: 'pluginsInfo',
		400: 'error',
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
	params: t.Object({ pluginId: t.String({ title: 'Plugin ID', description: 'ID of the plugin whose information will be retrieved' }) }),
	response: {
		200: 'pluginInfo',
		400: 'error',
		404: 'error',
	},
}).delete('/:pluginId', async ({ mh, params, log, HttpError, set }) => {
	const id = params.pluginId
	const p = mh.getPlugin(id)
	if (!p) throw HttpError.NotFound('Plugin not found')
	if (p.id === 'core_plugin') throw HttpError.InternalServer('Cannot delete core_plugin')
	try {
		await mh.removePlugin(id)
		set.status = 204
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
	params: t.Object({ pluginId: t.String({ title: 'Plugin ID', description: 'ID of the plugin to delete' }) }),
	response: {
		204: t.Void({ title: 'Plugin removed', description: 'The plugin has been removed' }),
		400: 'error',
		404: 'error',
		500: 'error',
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
		throw HttpError.InternalServer('Failed to install plugin')
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
	}, {
		title: 'Plugin file',
		description: 'The plugin file to be uploaded',
	}),
	response: {
		200: t.Object({ info: t.String() }, { title: 'Plugin installation info', description: 'Plugin installed successfully' }),
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
	}, {
		title: 'Plugin URL',
		description: 'The URL of the plugin to be installed',
	}),
	response: {
		200: t.Object({ info: t.String() }, { title: 'Plugin installation info', description: 'Plugin installed successfully' }),
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
	params: t.Object({ pluginId: t.String({ title: 'Plugin ID', description: 'ID of the plugin to toggle' }) }),
	body: t.Object({ active: t.Boolean({ default: true }) }, { title: 'Plugin status', description: 'Status of the plugin' }),
	response: {
		200: t.Object({ active: t.Boolean() }, { title: 'Plugin status', description: 'Plugin toggled successfully' }),
		400: 'error',
		404: 'error',
		500: 'error',
	},
}).patch('/toggle/:pluginId/procedure/:procedureName', async ({ params, body, mh, db, HttpError }) => {
	const { pluginId, procedureName } = params, { active } = body
	const p = mh.getPlugin(pluginId)
	if (!p) throw HttpError.NotFound('Plugin not found')

	const tool = p.tools.find(t => t.name === procedureName)
	const form = p.forms.find(f => f.name === procedureName)
	if (!tool && !form) throw HttpError.NotFound('Procedure not found')

	if (tool) tool.active = active
	if (form) form.active = active

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
	}, {
		title: 'Plugin and procedure',
		description: 'ID of the plugin and name of the procedure to toggle',
	}),
	body: t.Object({ active: t.Boolean({ default: true }) }, { title: 'Procedure status', description: 'Status of the procedure' }),
	response: {
		200: t.Object({ active: t.Boolean() }, { title: 'Procedure activation status', description: 'Procedure toggled successfully' }),
		400: 'error',
		404: 'error',
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
		200: 'pluginsSettings',
		400: 'error',
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
	params: t.Object({ pluginId: t.String({ title: 'Plugin ID', description: 'ID of the plugin whose settings will be retrieved' }) }),
	response: {
		200: 'pluginSettings',
		400: 'error',
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
	params: t.Object({ pluginId: t.String({ title: 'Plugin ID', description: 'ID of the plugin whose settings will be set' }) }),
	body: t.Record(t.String(), t.Any(), {
		title: 'Plugin settings',
		description: 'New settings for the plugin',
		examples: [{
			foo: 'bar',
		}],
	}),
	response: {
		200: 'customSetting',
		400: 'error',
		404: 'error',
	},
})
