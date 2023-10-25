import type { FastifyPluginCallback } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { getAllowedEmbedders, getEmbedder } from '../factory/embedder.ts'
import { getDb, getEmbedderSettings, updateDb } from '../database.ts'
import { cheshireCat } from '../looking_glass/cheshire-cat.ts'
import { log } from '../logger.ts'
import { madHatter } from '../mad_hatter/mad-hatter.ts'

export const embedder: FastifyPluginCallback = (fastify, opts, done) => {
	fastify.get('/settings', { schema: {
		description: 'Get the list of the available Embedders.',
		tags: ['Embedder'],
		summary: 'Get Embedders settings',
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
		const allowedEmbedders = getAllowedEmbedders()
		const options = allowedEmbedders.map(({ config, ...args }) => ({
			...args,
			schema: zodToJsonSchema(config),
			value: getDb().embedders.filter(l => l.name === args.name)[0]?.value ?? {},
		}))
		return {
			selected: getDb().selectedEmbedder,
			options,
		}
	})

	fastify.get<{
		Params: { embedderId: string }
	}>('/settings/:embedderId', { schema: {
		description: 'Get settings and schema of the specified Embedder.',
		tags: ['Embedder'],
		summary: 'Get Embedder settings',
		response: {
			200: { $ref: 'ModelInfo' },
			404: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const id = req.params.embedderId
		const emb = getEmbedder(id)
		if (!emb) { return rep.notFound('The passed Embedder ID doesn\'t exist in the list of available Embedders.') }
		const value = getEmbedderSettings(id) ?? {}
		return {
			...emb,
			schema: zodToJsonSchema(emb.config),
			value,
		}
	})

	fastify.put<{
		Params: { embedderId: string }
		Body: Record<string, any>
	}>('/settings/:embedderId', { schema: {
		description: 'Upsert the specified Embedder setting.',
		tags: ['Embedder'],
		summary: 'Update Embedder settings',
		body: { type: 'object' },
		response: {
			200: { $ref: 'Setting' },
			400: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const id = req.params.embedderId
		const emb = getEmbedder(id)
		if (!emb) { return rep.notFound('The passed Embedder ID doesn\'t exist in the list of available Embedders.') }
		const parsed = emb.config.passthrough().safeParse(req.body)
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
			db.selectedEmbedder = id
			const embIndex = db.embedders.findIndex(l => l.name === id)
			if (embIndex === -1) { db.embedders.push({ name: id, value: parsed.data }) }
			else db.embedders[embIndex]!.value = parsed.data
		})
		return {
			name: id,
			value: parsed.data,
		}
	})

	done()
}
