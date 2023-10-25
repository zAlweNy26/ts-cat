import type { FastifyPluginCallback } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { getDb, getLLMSettings, updateDb } from '../database.ts'
import { getAllowedLLMs, getLLM } from '../factory/llm.ts'
import type { Message } from '../utils.ts'
import { cheshireCat } from '../looking_glass/cheshire-cat.ts'
import { madHatter } from '../mad_hatter/mad-hatter.ts'
import { log } from '../logger.ts'

export const llm: FastifyPluginCallback = (fastify, opts, done) => {
	fastify.get('/settings', { schema: {
		description: 'Get the list of the available Large Language Models.',
		tags: ['LLM'],
		summary: 'Get LLMs settings',
		response: {
			200: {
				type: 'object',
				required: ['selected', 'options'],
				properties: {
					selected: { type: 'string' },
					options: {
						type: 'array',
						items: { $ref: 'ModelInfo' },
					},
				},
			},
		},
	} }, () => {
		const allowedLlms = getAllowedLLMs()
		const options = allowedLlms.map(({ config, ...args }) => ({
			...args,
			schema: zodToJsonSchema(config),
			value: getDb().llms.filter(l => l.name === args.name)[0]?.value ?? {},
		}))
		return {
			selected: getDb().selectedLLM,
			options,
		}
	})

	fastify.get<{
		Params: { llmId: string }
	}>('/settings/:llmId', { schema: {
		description: 'Get settings and schema of the specified Large Language Model.',
		tags: ['LLM'],
		summary: 'Get LLM settings',
		response: {
			200: { $ref: 'ModelInfo' },
			404: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const id = req.params.llmId
		const llm = getLLM(id)
		if (!llm) { return rep.notFound('The passed LLM ID doesn\'t exist in the list of available LLMs.') }
		const value = getLLMSettings(id) ?? {}
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
		tags: ['LLM'],
		summary: 'Update LLM settings',
		body: { type: 'object' },
		response: {
			200: { $ref: 'Setting' },
			400: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const id = req.params.llmId
		const llm = getLLM(id)
		if (!llm) { return rep.notFound('The passed LLM ID doesn\'t exist in the list of available LLMs.') }
		const parsed = llm.config.passthrough().safeParse(req.body)
		if (!parsed.success) { return rep.badRequest(parsed.error.errors.join(', ')) }
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
		updateDb((db) => {
			db.selectedLLM = id
			const llmIndex = db.llms.findIndex(l => l.name === id)
			if (llmIndex === -1) { db.llms.push({ name: id, value: parsed.data }) }
			else db.llms[llmIndex]!.value = parsed.data
		})
		return {
			name: id,
			value: parsed.data,
		}
	})

	fastify.post<{
		Body: Message
	}>('/chat', { schema: {
		description: 'Get a response from the Cheshire Cat via endpoint.',
		tags: ['LLM'],
		summary: 'Chat with the cat',
		body: {
			type: 'object',
			required: ['text'],
			properties: {
				text: { type: 'string' },
			},
		},
		response: {
			200: { type: 'object', additionalProperties: true },
			400: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const res = await req.stray.run(req.body)
		if (!res) { rep.imateapot('I\'m sorry, I can\'t do that.') }
		return res
	})

	done()
}
