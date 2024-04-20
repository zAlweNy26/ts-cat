import type { FastifyPluginCallback } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { cheshireCat } from '@lg/cheshire-cat.ts'
import { getAllowedLLMs, getLLM } from '@factory/llm.ts'
import { type Message, zodBoolean } from '@utils'
import { madHatter } from '@mh/mad-hatter.ts'
import { log } from '@logger'
import { z } from 'zod'
import { SwaggerTags, customSetting, modelInfo } from '@/context.ts'

export const llm: FastifyPluginCallback = async (fastify) => {
	fastify.get('/settings', { schema: {
		description: 'Get the list of the available Large Language Models.',
		tags: [SwaggerTags['Large Language Model']],
		summary: 'Get LLMs settings',
		response: {
			200: z.object({
				selected: z.string(),
				options: z.array(modelInfo),
			}),
		},
	} }, () => {
		const db = fastify.db.data
		const allowedLlms = getAllowedLLMs()
		const options = allowedLlms.map(({ config, ...args }) => ({
			...args,
			schema: zodToJsonSchema(config),
			value: db.llms.filter(l => l.name === args.name)[0]?.value ?? {},
		}))
		return {
			selected: db.selectedLLM,
			options,
		}
	})

	fastify.get<{
		Params: { llmId: string }
	}>('/settings/:llmId', { schema: {
		description: 'Get settings and schema of the specified Large Language Model.',
		tags: [SwaggerTags['Large Language Model']],
		summary: 'Get LLM settings',
		params: z.object({
			llmId: z.string().min(1).trim(),
		}),
		response: {
			200: modelInfo,
			404: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const id = req.params.llmId
		const llm = getLLM(id)
		if (!llm) return rep.notFound('The passed LLM ID doesn\'t exist in the list of available LLMs.')
		const value = fastify.db.getLLMSettings(id) ?? {}
		return {
			...llm,
			schema: zodToJsonSchema(llm.config),
			value,
		}
	})

	fastify.put<{
		Params: { llmId: string }
		Body: Record<string, any>
	}>('/settings/:llmId', { schema: {
		description: 'Upsert the specified Large Language Model setting.',
		tags: [SwaggerTags['Large Language Model']],
		summary: 'Update LLM settings',
		body: z.record(z.any()),
		params: z.object({
			llmId: z.string().min(1).trim(),
		}),
		response: {
			200: customSetting,
			400: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const id = req.params.llmId
		const llm = getLLM(id)
		if (!llm) return rep.notFound('The passed LLM ID doesn\'t exist in the list of available LLMs.')
		const parsed = llm.config.passthrough().safeParse(req.body)
		if (!parsed.success) return rep.badRequest(parsed.error.errors.join())
		cheshireCat.loadLanguageModel()
		cheshireCat.loadLanguageEmbedder()
		try {
			await cheshireCat.loadMemory()
			await madHatter.findPlugins()
		}
		catch (error) {
			log.error('Failed to load memory', error)
			return rep.badRequest('Failed to load memory for the selected embedder')
		}
		fastify.db.update((db) => {
			db.selectedLLM = id
			const llmIndex = db.llms.findIndex(l => l.name === id)
			if (llmIndex === -1) db.llms.push({ name: id, value: parsed.data })
			else db.llms[llmIndex]!.value = parsed.data
		})
		return {
			name: id,
			value: parsed.data,
		}
	})

	fastify.post<{
		Body: Message
		Querystring: {
			save: boolean
		}
	}>('/chat', { schema: {
		description: 'Get a response from the Cheshire Cat via endpoint.',
		tags: [SwaggerTags['Large Language Model']],
		summary: 'Chat with the cat',
		body: z.object({
			text: z.string().default('Hello world'),
		}).passthrough(),
		querystring: z.object({
			save: zodBoolean,
		}),
		response: {
			200: z.record(z.any()),
			400: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const { save } = req.query
		const res = await req.stray.run(req.body, save)
		if (!res) rep.imateapot('I\'m sorry, I can\'t do that.')
		return res
	})
}
