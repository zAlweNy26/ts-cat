import type { FastifyPluginCallback } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { cheshireCat } from '@lg/cheshire-cat.ts'
import { getAllowedEmbedders, getEmbedder } from '@factory/embedder.ts'
import { madHatter } from '@mh/mad-hatter.ts'
import { log } from '@logger'
import { z } from 'zod'
import { SwaggerTags, customSetting, errorSchema, modelInfo } from '@/context.ts'

export const embedder: FastifyPluginCallback = async (fastify) => {
	fastify.get('/settings', { schema: {
		description: 'Get the list of the available Embedders.',
		tags: [SwaggerTags.Embedder],
		summary: 'Get Embedders settings',
		response: {
			200: z.object({
				selected: z.string(),
				options: z.array(modelInfo),
			}),
		},
	} }, () => {
		const db = fastify.db.data
		const allowedEmbedders = getAllowedEmbedders()
		const options = allowedEmbedders.map(({ config, ...args }) => ({
			...args,
			schema: zodToJsonSchema(config),
			value: db.embedders.filter(l => l.name === args.name)[0]?.value ?? {},
		}))
		return {
			selected: db.selectedEmbedder,
			options,
		}
	})

	fastify.get<{
		Params: { embedderId: string }
	}>('/settings/:embedderId', { schema: {
		description: 'Get settings and schema of the specified Embedder.',
		tags: [SwaggerTags.Embedder],
		summary: 'Get Embedder settings',
		params: z.object({
			embedderId: z.string().min(1).trim(),
		}),
		response: {
			200: modelInfo,
			404: errorSchema,
		},
	} }, (req, rep) => {
		const id = req.params.embedderId
		const emb = getEmbedder(id)
		if (!emb) return rep.notFound('The passed Embedder ID doesn\'t exist in the list of available Embedders.')
		const value = fastify.db.getEmbedderSettings(id) ?? {}
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
		tags: [SwaggerTags.Embedder],
		summary: 'Update Embedder settings',
		body: z.record(z.any()),
		params: z.object({
			embedderId: z.string().min(1).trim(),
		}),
		response: {
			200: customSetting,
			400: errorSchema,
		},
	} }, async (req, rep) => {
		const id = req.params.embedderId
		const emb = getEmbedder(id)
		if (!emb) return rep.notFound('The passed Embedder ID doesn\'t exist in the list of available Embedders.')
		const parsed = emb.config.safeParse(req.body)
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
			db.selectedEmbedder = id
			const embIndex = db.embedders.findIndex(l => l.name === id)
			if (embIndex === -1) db.embedders.push({ name: id, value: parsed.data })
			else db.embedders[embIndex]!.value = parsed.data
		})
		return {
			name: id,
			value: parsed.data,
		}
	})
}
