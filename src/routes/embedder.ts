import { getAllowedEmbedders, getEmbedder } from '@factory/embedder.ts'
import { Elysia, t } from 'elysia'
import { cheshireCat as cat } from '@lg/cheshire-cat.ts'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { modelInfo, serverContext, swaggerTags } from '@/context'

export const embedderRoutes = new Elysia({
	name: 'embedder',
	prefix: '/embedder',
	detail: { tags: [swaggerTags.embedder.name] },
}).use(serverContext)
	.get('/settings', ({ db }) => {
		const allowedEmbedders = getAllowedEmbedders()
		const options = allowedEmbedders.map(({ config, ...args }) => ({
			...args,
			schema: zodToJsonSchema(config),
			value: db.data.embedders.filter(l => l.name === args.name)[0]?.value ?? {},
		}))
		return {
			selected: db.data.selectedEmbedder,
			options,
		}
	}, {
		detail: {
			description: 'Get the list of the available embedders.',
			summary: 'Get embedders settings',
		},
		response: {
			200: t.Object({
				selected: t.String(),
				options: t.Array(t.Ref(modelInfo)),
			}),
			400: 'error',
		},
	})
	.get('/settings/:embedderId', ({ db, params, HttpError }) => {
		const id = params.embedderId
		const emb = getEmbedder(id)
		if (!emb) throw HttpError.NotFound(`The passed embedder id '${id}' doesn't exist in the list of available embedders.`)
		const value = db.getEmbedderSettings(id) ?? {}
		return {
			...emb,
			schema: zodToJsonSchema(emb.config),
			value,
		}
	}, {
		params: t.Object({ embedderId: t.String() }),
		detail: {
			description: 'Get settings and schema of the specified embedder.',
			summary: 'Get embedder settings',
		},
		response: {
			200: 'modelInfo',
			400: 'error',
			404: 'error',
		},
	})
	.put('/settings/:embedderId', async ({ mh, db, params, body, log, HttpError }) => {
		const id = params.embedderId
		const emb = getEmbedder(id)
		if (!emb) throw HttpError.NotFound(`The passed embedder id '${id}' doesn't exist in the list of available embedders.`)
		const parsed = emb.config.safeParse(body)
		if (!parsed.success) throw HttpError.InternalServer(parsed.error.errors.map(e => e.message).join())
		cat.loadLanguageModel()
		cat.loadLanguageEmbedder()
		try {
			await cat.loadMemory()
			await mh.findPlugins()
		}
		catch (error) {
			log.error('Failed to load memory', error)
			throw HttpError.InternalServer('Failed to load memory for the selected embedder')
		}
		db.update((db) => {
			db.selectedEmbedder = id
			const embIndex = db.embedders.findIndex(l => l.name === id)
			if (embIndex === -1) db.embedders.push({ name: id, value: parsed.data })
			else db.embedders[embIndex]!.value = parsed.data
		})
		return {
			name: id,
			value: parsed.data,
		}
	}, {
		params: t.Object({ embedderId: t.String() }),
		body: 'generic',
		detail: {
			description: 'Upsert the specified embedder setting.',
			summary: 'Update embedder settings',
		},
		response: {
			200: 'customSetting',
			400: 'error',
			404: 'error',
		},
	})
