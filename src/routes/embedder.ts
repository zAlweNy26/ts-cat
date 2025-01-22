import { serverContext, swaggerTags } from '@/context'
import { getAllowedEmbedders, getEmbedder, getEmbedderSettings } from '@factory/embedder.ts'
import { cheshireCat as cat } from '@lg/cheshire-cat.ts'
import { Elysia, t } from 'elysia'
import { zodToJsonSchema } from 'zod-to-json-schema'

export const embedderRoutes = new Elysia({
	name: 'embedder',
	prefix: '/embedder',
	detail: { tags: [swaggerTags.embedder.name] },
}).use(serverContext).get('/settings', async ({ db }) => {
	const allowedEmbedders = await getAllowedEmbedders()
	const options = allowedEmbedders.map(({ config, info }) => ({
		...info,
		schema: zodToJsonSchema(config),
		value: db.data.embedders.filter(l => l.name === info.id)[0]?.value ?? {},
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
		200: 'modelsInfo',
		400: 'error',
	},
}).get('/settings/:embedderId', async ({ params, HttpError }) => {
	const id = params.embedderId
	const emb = await getEmbedder(id)
	if (!emb) throw HttpError.NotFound(`The passed embedder id '${id}' doesn't exist in the list of available embedders.`)
	const value = getEmbedderSettings(id) ?? {}
	return {
		...emb.info,
		schema: zodToJsonSchema(emb.config),
		value,
	}
}, {
	params: t.Object({ embedderId: t.String({ title: 'Embedder ID', description: 'ID of one of the available embedders' }) }),
	detail: {
		description: 'Get settings and schema of the specified embedder.',
		summary: 'Get embedder settings',
	},
	response: {
		200: 'modelInfo',
		400: 'error',
		404: 'error',
	},
}).put('/settings/:embedderId', async ({ mh, db, params, body, log, HttpError }) => {
	const id = params.embedderId
	const emb = await getEmbedder(id)
	if (!emb) throw HttpError.NotFound(`The passed embedder id '${id}' doesn't exist in the list of available embedders.`)
	const parsed = emb.config.safeParse(body)
	if (!parsed.success) throw HttpError.InternalServer(parsed.error.errors.map(e => e.message).join())
	cat.loadNaturalLanguage()
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
	params: t.Object({ embedderId: t.String({ title: 'Embedder ID', description: 'ID of one of the available embedders' }) }),
	body: 'generic',
	detail: {
		description: 'Upsert the specified embedder setting.',
		summary: 'Update embedder settings',
	},
	response: {
		200: 'customSetting',
		400: 'error',
		404: 'error',
		500: 'error',
	},
})
