import { getAllowedLLMs, getLLM } from '@factory/llm.ts'
import { NotFoundError, ParseError, t } from 'elysia'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { authMiddleware, modelInfo, swaggerTags } from '@/context'
import type { App } from '@/main'

export function llm(app: App) {
	return app.group('/llm', { detail: { tags: [swaggerTags.llm.name] } }, i => i.use(authMiddleware)
		.get('/settings', ({ db }) => {
			const allowedLlms = getAllowedLLMs()
			const options = allowedLlms.map(({ config, ...args }) => ({
				...args,
				schema: zodToJsonSchema(config),
				value: db.data.llms.filter(l => l.name === args.name)[0]?.value ?? {},
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
		})
		.get('/settings/:llmId', ({ db, params }) => {
			const id = params.llmId
			const llm = getLLM(id)
			if (!llm) throw new NotFoundError(`The passed LLM id '${id}' doesn't exist in the list of available LLMs.`)
			const value = db.getLLMSettings(id) ?? {}
			return {
				...llm,
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
		})
		.put('/settings/:llmId', async ({ cat, mh, db, params, body, log }) => {
			const id = params.llmId
			const llm = getLLM(id)
			if (!llm) throw new NotFoundError(`The passed embedder id '${id}' doesn't exist in the list of available embedders.`)
			const parsed = llm.config.safeParse(body)
			if (!parsed.success) throw new ParseError(parsed.error.errors.map(e => e.message).join())
			cat.loadLanguageModel()
			cat.loadLanguageEmbedder()
			try {
				await cat.loadMemory()
				await mh.findPlugins()
			}
			catch (error) {
				log.error('Failed to load memory', error)
				throw new Error('Failed to load memory for the selected embedder')
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
		.post('/chat', async ({ stray, body, query }) => {
			const { save } = query
			const res = await stray.run(body, save)
			return res
		}, {
			body: t.Object({
				text: t.String({ default: 'Hello world' }),
			}),
			query: t.Object({
				save: t.BooleanString({ default: true }),
			}),
			detail: {
				summary: 'Chat',
				description: 'Get a response from the Cheshire Cat via endpoint.',
			},
			response: {
				200: t.Record(t.String(), t.Any()),
				400: 'error',
			},
		}))
}
