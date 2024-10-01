import { modelInfo, serverContext, swaggerTags } from '@/context'
import { getAllowedLLMs, getLLM } from '@factory/llm.ts'
import { cheshireCat as cat } from '@lg/cheshire-cat.ts'
import { Elysia, t } from 'elysia'
import { zodToJsonSchema } from 'zod-to-json-schema'

export const llmRoutes = new Elysia({
	name: 'llm',
	prefix: '/llm',
	detail: { tags: [swaggerTags.llm.name] },
}).use(serverContext).get('/settings', ({ db }) => {
	const allowedLlms = getAllowedLLMs()
	const options = allowedLlms.map(({ config, info }) => ({
		...info,
		schema: zodToJsonSchema(config),
		value: db.data.llms.filter(l => l.name === info.id)[0]?.value ?? {},
	}))
	return {
		selected: db.data.selectedLLM,
		options,
	}
}, {
	detail: {
		description: 'Get the list of the available Large Language Models.',
		summary: 'Get LLMs settings',
	},
	response: {
		200: t.Object({
			selected: t.String(),
			options: t.Array(t.Ref(modelInfo)),
		}),
		400: 'error',
	},
}).get('/settings/:llmId', ({ db, params, HttpError }) => {
	const id = params.llmId
	const llm = getLLM(id)
	if (!llm) throw HttpError.NotFound(`The passed LLM id '${id}' doesn't exist in the list of available LLMs.`)
	const value = db.getLLMSettings(id) ?? {}
	return {
		...llm.info,
		schema: zodToJsonSchema(llm.config),
		value,
	}
}, {
	params: t.Object({ llmId: t.String() }),
	detail: {
		description: 'Get settings and schema of the specified Large Language Model.',
		summary: 'Get LLM settings',
	},
	response: {
		200: 'modelInfo',
		400: 'error',
		404: 'error',
	},
}).put('/settings/:llmId', async ({ mh, db, params, body, log, HttpError }) => {
	const id = params.llmId
	const llm = getLLM(id)
	if (!llm) throw HttpError.NotFound(`The passed embedder id '${id}' doesn't exist in the list of available embedders.`)
	const parsed = llm.config.safeParse(body)
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
		db.selectedLLM = id
		const llmIndex = db.llms.findIndex(l => l.name === id)
		if (llmIndex === -1) db.llms.push({ name: id, value: parsed.data })
		else db.llms[llmIndex]!.value = parsed.data
	})
	return {
		name: id,
		value: parsed.data,
	}
}, {
	params: t.Object({ llmId: t.String() }),
	body: 'generic',
	detail: {
		description: 'Upsert the specified Large Language Model setting.',
		summary: 'Update LLM settings',
	},
	response: {
		200: 'customSetting',
		400: 'error',
		404: 'error',
	},
})
