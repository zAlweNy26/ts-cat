import { createReadStream, createWriteStream, mkdirSync, readdirSync } from 'node:fs'
import { createGunzip } from 'node:zlib'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { FastifyPluginCallback } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import type { MultipartFile } from '@fastify/multipart'
import { madHatter } from '@mh/mad-hatter.ts'
import { log } from '@logger'
import { updateDb } from '@db'
import type { HookNames } from '@hook'

export const plugins: FastifyPluginCallback = (fastify, opts, done) => {
	fastify.get('/', { schema: {
		description: 'Get list of available plugins.',
		tags: ['Plugins'],
		summary: 'Get plugins',
		response: {
			200: {
				type: 'object',
				properties: {
					installed: { type: 'array', items: { $ref: 'PluginInfo' } },
					registry: { type: 'array', items: { $ref: 'PluginInfo' } },
				},
			},
		},
	} }, () => {
		const ps = madHatter.installedPlugins.map(({ info }) => info)

		return {
			installed: ps,
			registry: [],
		}
	})

	fastify.get<{
		Params: { pluginId: string }
	}>('/:pluginId', { schema: {
		description: 'Returns information on a single plugin.',
		tags: ['Plugins'],
		summary: 'Get plugin details',
		response: {
			200: { $ref: 'PluginInfo' },
			404: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const { pluginId } = req.params
		const p = madHatter.getPlugin(pluginId)
		if (!p) { return rep.notFound('Plugin not found') }
		return p.info
	})

	fastify.delete<{
		Params: { pluginId: string }
	}>('/:pluginId', { schema: {
		description: 'Totally removes the specified plugin.',
		tags: ['Plugins'],
		summary: 'Delete plugin',
		response: {
			204: { description: 'Plugin deleted successfully.', type: 'null' },
			404: { $ref: 'HttpError' },
			400: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const { pluginId } = req.params
		const p = madHatter.getPlugin(pluginId)
		if (!p) { return rep.notFound('Plugin not found') }
		if (p.id === 'core_plugin') { return rep.badRequest('Cannot delete core plugin') }
		madHatter.removePlugin(pluginId)
		return rep.code(204)
	})

	fastify.post<{
		Body: {
			file: MultipartFile
		}
	}>('/upload', { schema: {
		description: 'Install a new plugin from a zip file.',
		tags: ['Plugins'],
		summary: 'Install plugin',
		consumes: ['multipart/form-data'],
		body: {
			type: 'object',
			required: ['file'],
			properties: {
				file: { isFile: true },
			},
		},
		response: {
			200: { type: 'object', properties: { info: { type: 'string' } } },
			400: { $ref: 'HttpError' },
			500: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const { file } = req.body
		const allowedTypes = ['application/zip', 'application/x-zip-compressed', 'application/x-tar', 'application/x-gzip', 'application/x-bzip2']
		if (!allowedTypes.includes(file.mimetype)) { return rep.badRequest('Invalid file type. It must be one of the following: zip, tar, gzip, bzip2') }
		log.info(`Uploading plugin ${file.filename}`)

		const extractDir = join(tmpdir(), 'ccat-plugin-extract')
		mkdirSync(extractDir, { recursive: true })
		const tempFilePath = join(extractDir, file.filename)

		file.file.pipe(createWriteStream(tempFilePath)).on('finish', () => {
			createReadStream(extractDir)
				.pipe(createGunzip())
				.on('end', async () => {
					const files = readdirSync(tempFilePath)
					const tsFiles = files.filter(f => f.endsWith('.ts'))
					if (tsFiles.length === 0) {
						log.error('No .ts files found in the extracted plugin folder')
						return rep.badRequest('No .ts files found in the extracted plugin folder')
					}
					try {
						const plugin = await madHatter.installPlugin(tempFilePath)
						madHatter.togglePlugin(plugin.id)
					}
					catch (error) {
						log.warn(error)
					}
				})
				.on('error', (err) => {
					log.error(`Error unzipping plugin: ${err.message}`)
					return rep.internalServerError('Error unzipping plugin')
				})
		})

		return {
			info: 'Plugin is being installed asynchronously',
		}
	})

	fastify.post<{
		Body: {
			url: string
		}
	}>('/upload/registry', { schema: {
		description: 'Install a new plugin from the registry.',
		tags: ['Plugins'],
		summary: 'Install plugin from registry',
		body: {
			type: 'object',
			required: ['url'],
			properties: {
				url: { type: 'string' },
			},
		},
		response: {
			200: { type: 'object', properties: { info: { type: 'string' } } },
			400: { $ref: 'HttpError' },
		},
	} }, (req) => {
		const { url } = req.body
		log.info(`Installing plugin from registry: ${url}`)
		return {
			info: 'Plugin is being installed asynchronously',
		}
	})

	fastify.patch<{
		Params: { pluginId: string }
	}>('/toggle/:pluginId', { schema: {
		description: 'Enable or disable a single plugin.',
		tags: ['Plugins'],
		summary: 'Toggle plugin',
		response: {
			200: {
				type: 'object',
				properties: {
					active: { type: 'boolean' },
				},
			},
			404: { $ref: 'HttpError' },
			400: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const { pluginId } = req.params
		const p = madHatter.getPlugin(pluginId)
		if (!p) { return rep.notFound('Plugin not found') }
		if (p.id === 'core_plugin') { return rep.badRequest('Cannot toggle core plugin') }
		const active = madHatter.togglePlugin(pluginId)
		return {
			active,
		}
	})

	fastify.patch<{
		Params: {
			pluginId: string
			procedureName: string
		}
	}>('/toggle/:pluginId/procedure/:procedureName', { schema: {
		description: 'Enable or disable a single procedure of a plugin.',
		tags: ['Plugins'],
		summary: 'Toggle plugin procedure',
		response: {
			200: {
				type: 'object',
				properties: {
					active: { type: 'boolean' },
				},
			},
			404: { $ref: 'HttpError' },
			400: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const { pluginId, procedureName } = req.params
		const p = madHatter.getPlugin(pluginId)
		if (!p) { return rep.notFound('Plugin not found') }
		const tool = p.tools.find(t => t.name === procedureName)
		const form = p.forms.find(f => f.name === procedureName)
		if (!tool && !form) { return rep.notFound('Procedure not found') }
		if (tool) { tool.active = !tool.active }
		if (form) { form.active = !form.active }
		updateDb((db) => {
			if (tool) {
				if (tool.active) { db.activeTools.push(procedureName) }
				else db.activeTools = db.activeTools.filter(t => t !== procedureName)
			}
			else if (form) {
				if (form.active) { db.activeForms.push(procedureName) }
				else db.activeForms = db.activeForms.filter(f => f !== procedureName)
			}
		})
		return {
			active: (tool?.active ?? form?.active) ?? false,
		}
	})

	fastify.get('/settings', { schema: {
		description: 'Returns the settings of all the plugins.',
		tags: ['Plugins'],
		summary: 'Get plugins settings',
		response: {
			200: {
				type: 'object',
				properties: {
					settings: {
						type: 'array',
						items: { $ref: 'PluginSetting' },
					},
				},
			},
		},
	} }, () => {
		const ps = madHatter.installedPlugins.map(p => ({
			name: p.id,
			value: p.settings,
			schema: zodToJsonSchema(p.schema),
		}))

		return {
			settings: ps,
		}
	})

	fastify.get<{
		Params: {
			pluginId: string
		}
	}>('/settings/:pluginId', { schema: {
		description: 'Returns the settings of the specified plugin.',
		tags: ['Plugins'],
		summary: 'Get plugin settings',
		response: {
			200: { $ref: 'PluginSetting' },
			404: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const { pluginId } = req.params
		const p = madHatter.getPlugin(pluginId)
		if (!p) { return rep.notFound('Plugin not found') }
		return {
			name: p.id,
			value: p.settings,
			schema: zodToJsonSchema(p.schema),
		}
	})

	fastify.put<{
		Params: {
			pluginId: string
		}
	}>('/settings/:pluginId', { schema: {
		description: 'Updates the settings of the specified plugin.',
		tags: ['Plugins'],
		summary: 'Update plugin settings',
		body: { type: 'object' },
		response: {
			200: { $ref: 'Setting' },
			400: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const id = req.params.pluginId
		const p = madHatter.getPlugin(id)
		if (!p) { return rep.notFound('Plugin not found') }
		const parsed = p.schema.passthrough().safeParse(req.body)
		if (!parsed.success) { return rep.badRequest(parsed.error.errors.join()) }
		p.settings = parsed.data
		return {
			name: id,
			value: parsed.data,
		}
	})

	done()
}
