import type { FastifyPluginCallback } from 'fastify'
import type { MemoryDocument } from '@lg/stray-cat.ts'
import { cheshireCat } from '@lg/cheshire-cat.ts'
import type { FilterMatch } from '@memory/vector-memory-collection.ts'
import { madHatter } from '@mh/mad-hatter.ts'
import { log } from '@logger'
import { z } from 'zod'
import { SwaggerTags, errorSchema } from '@/context.ts'

export const memory: FastifyPluginCallback = async (fastify) => {
	fastify.get<{
		Querystring: {
			text: string
			k: number
		}
	}>('/recall', { schema: {
		description: 'Search k memories similar to given text.',
		tags: [SwaggerTags.Memory],
		summary: 'Recall memories from text',
		querystring: z.object({
			text: z.string().min(1).trim(),
			k: z.coerce.number().default(10),
		}),
		response: {
			200: z.object({
				query: z.object({
					text: z.string(),
					vector: z.array(z.number()),
				}),
				vectors: z.object({
					embedder: z.string(),
					collections: z.record(z.array(z.object({
						id: z.string(),
						vector: z.array(z.number()),
						score: z.number(),
						pageContent: z.string(),
						metadata: z.record(z.any()).optional(),
					}))),
				}),
			}).openapi({
				example: {
					query: {
						text: 'Hello, world!',
						vector: [0.1, 0.2, 0.3],
					},
					vectors: {
						embedder: 'OpenAIEmbedder',
						collections: {
							declarative: [],
							procedural: [],
							episodic: [
								{
									id: '1da746f8-a832-4a45-a120-4549e17a1df7',
									score: 0.8,
									vector: [0.1, 0.2, 0.3],
									pageContent: 'Hello, John!',
									metadata: {
										source: 'user',
										when: 1712950290994,
									},
								},
							],
						},
					},
				},
			}),
			500: errorSchema,
		},
	} }, async (req, rep) => {
		const { text, k = 10 } = req.query
		const userId = req.stray.userId

		const queryEmbedding = await cheshireCat.currentEmbedder.embedQuery(text)
		const recalled: Record<string, MemoryDocument[]> = {}

		for (const collection of Object.values(cheshireCat.currentMemory.collections)) {
			recalled[collection.name] = []
			let userFilter: Record<string, FilterMatch> | undefined
			if (collection.name === 'episodic') userFilter = { source: { any: [userId] } }
			try {
				const docs = await collection.recallMemoriesFromEmbedding(queryEmbedding, userFilter, k)
				recalled[collection.name] = docs
			}
			catch (error) {
				log.info('Error recalling memories from collection:', collection)
				log.error(error)
				return rep.internalServerError('Error recalling memories.')
			}
		}

		return {
			query: {
				text,
				vector: queryEmbedding,
			},
			vectors: {
				embedder: fastify.db.data.selectedEmbedder,
				collections: recalled,
			},
		}
	})

	fastify.get('/collections', { schema: {
		description: 'Get list of available collections.',
		tags: [SwaggerTags.Memory],
		summary: 'Get collections',
		response: {
			200: z.object({
				collections: z.array(z.object({
					name: z.string(),
					size: z.number(),
				})),
			}).openapi({
				example: {
					collections: [
						{
							name: 'declarative',
							size: 3,
						},
						{
							name: 'episodic',
							size: 6,
						},
						{
							name: 'procedural',
							size: 9,
						},
					],
				},
			}),
			500: errorSchema,
		},
	} }, async () => {
		const collections = Object.keys(cheshireCat.currentMemory.collections)
		const infos = []
		for (const collection of collections) {
			const info = await cheshireCat.currentMemory.db.getCollection(collection)
			infos.push({
				name: collection,
				size: info.vectors_count ?? 0,
			})
		}
		return {
			collections: infos,
		}
	})

	fastify.delete('/collections', { schema: {
		description: 'Delete and recreate all the collections.',
		tags: [SwaggerTags.Memory],
		summary: 'Wipe collections',
		response: {
			204: z.null().describe('All collections were wiped successfully.'),
			500: errorSchema,
		},
	} }, async (_req, rep) => {
		try {
			const collections = Object.keys(cheshireCat.currentMemory.collections)
			for (const collection of collections) await cheshireCat.currentMemory.db.deleteCollection(collection)

			await cheshireCat.loadMemory()
			await madHatter.findPlugins()
			return rep.code(204)
		}
		catch (error) {
			log.error(error)
			return rep.internalServerError('Error while wiping collections.')
		}
	})

	fastify.delete<{
		Params: { collectionId: string }
	}>('/collections/:collectionId', { schema: {
		description: 'Delete and recreate the specified collection.',
		tags: [SwaggerTags.Memory],
		summary: 'Wipe single collection',
		params: z.object({
			collectionId: z.string().min(1).trim(),
		}),
		response: {
			204: z.null().describe('The collection was wiped successfully.'),
			404: errorSchema,
			500: errorSchema,
		},
	} }, async (req, rep) => {
		const id = req.params.collectionId
		try {
			const collections = Object.keys(cheshireCat.currentMemory.collections)
			if (!collections.includes(id)) return rep.notFound('Collection not found.')
			await cheshireCat.currentMemory.db.deleteCollection(id)
			await cheshireCat.loadMemory()
			await madHatter.findPlugins()
			return rep.code(204)
		}
		catch (error) {
			log.error(error)
			return rep.internalServerError(`Error while wiping "${id}" collection.`)
		}
	})

	fastify.post<{
		Params: { collectionId: string }
		Querystring: {
			k: number
		}
		Body: Record<string, any>
	}>('/collections/:collectionId/documents', { schema: {
		description: 'Get list of documents filtered by metadata.',
		tags: [SwaggerTags.Memory],
		summary: 'Get collection\'s documents by metadata',
		externalDocs: {
			description: 'Metadata filtering conditions',
			url: 'https://qdrant.tech/documentation/concepts/filtering/#filtering-conditions',
		},
		params: z.object({
			collectionId: z.string().min(1).trim(),
		}),
		querystring: z.object({
			k: z.coerce.number().default(10),
		}),
		body: z.record(z.any()).openapi({
			example: {
				source: {
					any: ['user'],
				},
			},
		}),
		response: {
			200: z.object({
				documents: z.array(z.object({
					id: z.string(),
					pageContent: z.string(),
					metadata: z.record(z.any()).openapi({
						example: {
							source: 'pizza-form',
							trigger: 'description',
							type: 'form',
							when: 1712950292521,
						},
					}),
				})),
			}),
			404: errorSchema,
			500: errorSchema,
		},
	} }, async (req, rep) => {
		const id = req.params.collectionId
		const limit = req.query.k
		try {
			const collections = Object.keys(cheshireCat.currentMemory.collections)
			if (!collections.includes(id)) return rep.notFound('Collection not found.')
			const points = await cheshireCat.currentMemory.collections[id]!.getAllPoints(limit, req.body)
			return {
				documents: points.map(p => ({ ...p.payload, id: p.id })),
			}
		}
		catch (error) {
			log.error(error)
			return rep.internalServerError(`Error while retrieving "${id}" collection's documents.`)
		}
	})

	fastify.delete<{
		Params: { collectionId: string }
		Body: Record<string, any>
	}>('/collections/:collectionId/points', { schema: {
		description: 'Delete points in memory by filter.',
		tags: [SwaggerTags.Memory],
		summary: 'Wipe memory points by metadata',
		externalDocs: {
			description: 'Metadata filtering conditions',
			url: 'https://qdrant.tech/documentation/concepts/filtering/#filtering-conditions',
		},
		params: z.object({
			collectionId: z.string().min(1).trim(),
		}),
		body: z.record(z.any()).openapi({
			example: {
				source: {
					any: ['user'],
				},
			},
		}),
		response: {
			204: z.null().describe('The collection\'s points was wiped successfully.'),
			404: errorSchema,
			500: errorSchema,
		},
	} }, async (req, rep) => {
		const id = req.params.collectionId
		const metadata = req.body.metadata
		try {
			const collections = Object.keys(cheshireCat.currentMemory.collections)
			if (!collections.includes(id)) return rep.notFound('Collection not found.')
			await cheshireCat.currentMemory.collections[id]?.deletePointsByMetadata(metadata)
			return rep.code(204)
		}
		catch (error) {
			log.error(error)
			return rep.internalServerError(`Error while wiping "${id}" collection's points.`)
		}
	})

	fastify.delete<{
		Params: {
			collectionId: string
			pointId: string
		}
	}>('/collections/:collectionId/points/:pointId', { schema: {
		description: 'Delete a specific point in memory.',
		tags: [SwaggerTags.Memory],
		summary: 'Wipe memory point',
		params: z.object({
			collectionId: z.string().min(1).trim(),
			pointId: z.string().min(1).trim(),
		}),
		response: {
			204: z.null().describe('The point was wiped successfully.'),
			404: errorSchema,
			500: errorSchema,
		},
	} }, async (req, rep) => {
		const { collectionId, pointId } = req.params
		try {
			const collections = Object.keys(cheshireCat.currentMemory.collections)
			if (!collections.includes(collectionId)) return rep.notFound('Collection not found.')
			const points = await cheshireCat.currentMemory.db.retrieve(collectionId, { ids: [pointId] })
			if (points.length === 0) return rep.notFound('Point not found.')
			await cheshireCat.currentMemory.collections[collectionId]?.deletePoints([pointId])
			return rep.code(204)
		}
		catch (error) {
			log.error(error)
			return rep.internalServerError(`Error while wiping "${collectionId}" collection's point ${pointId}.`)
		}
	})

	fastify.get('/conversation-history', { schema: {
		description: 'Get the specified user\'s conversation history from working memory.',
		tags: [SwaggerTags.Memory],
		summary: 'Get conversation history',
		response: {
			200: z.object({
				history: z.array(z.object({
					what: z.string(),
					who: z.string(),
					when: z.number(),
					why: z.object({
						input: z.string(),
						intermediateSteps: z.tuple([z.string(), z.string(), z.string()]).or(z.array(z.string())),
						memory: z.record(z.any()).optional(),
					}).optional(),
				})),
			}),
		},
	} }, (req) => {
		return {
			history: req.stray.getHistory(),
		}
	})

	fastify.delete('/conversation-history', { schema: {
		description: 'Delete the specified user\'s conversation history from working memory.',
		tags: [SwaggerTags.Memory],
		summary: 'Wipe conversation history',
		response: {
			204: z.null().describe('The conversation history was wiped successfully.'),
		},
	} }, (req, rep) => {
		req.stray.clearHistory()
		return rep.code(204)
	})
}
