import type { FastifyPluginCallback } from 'fastify'
import type { MemoryDocument } from '@lg/stray-cat.ts'
import { cheshireCat } from '@lg/cheshire-cat.ts'
import { getDb } from '@db'
import type { FilterMatch } from '@memory/vector-memory-collection.ts'
import { madHatter } from '@mh/mad-hatter.ts'
import { log } from '@logger'

export const memory: FastifyPluginCallback = (fastify, opts, done) => {
	fastify.get<{
		Querystring: {
			text: string
			k?: number
		}
	}>('/recall', { schema: {
		description: 'Search k memories similar to given text.',
		tags: ['Memory'],
		summary: 'Recall memories from text',
		querystring: {
			type: 'object',
			required: ['text'],
			properties: {
				text: { type: 'string', minLength: 1 },
				k: { type: 'number', default: 10 },
			},
		},
		response: {
			200: { type: 'object', additionalProperties: true },
			500: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const { text, k = 10 } = req.query
		const userId = req.stray.userId

		const queryEmbedding = await cheshireCat.currentEmbedder.embedQuery(text)
		const recalled: Record<string, MemoryDocument[]> = {}

		for (const collection of Object.values(cheshireCat.currentMemory.collections)) {
			recalled[collection.name] = []
			let userFilter: Record<string, FilterMatch> | undefined
			if (collection.name === 'episodic') { userFilter = { source: { any: [userId] } } }
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
				embedder: getDb().selectedEmbedder,
				collections: recalled,
			},
		}
	})

	fastify.get('/collections', { schema: {
		description: 'Get list of available collections.',
		tags: ['Memory'],
		summary: 'Get collections',
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
		tags: ['Memory'],
		summary: 'Wipe collections',
		response: {
			204: { description: 'All collections were wiped successfully.', type: 'null' },
			500: { $ref: 'HttpError' },
		},
	} }, async (_req, rep) => {
		try {
			const collections = Object.keys(cheshireCat.currentMemory.collections)
			for (const collection of collections) { await cheshireCat.currentMemory.db.deleteCollection(collection) }

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
		tags: ['Memory'],
		summary: 'Wipe single collection',
		params: {
			type: 'object',
			properties: {
				collectionId: { type: 'string' },
			},
		},
		response: {
			204: { description: 'The collection was wiped successfully.', type: 'null' },
			404: { $ref: 'HttpError' },
			500: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const id = req.params.collectionId
		try {
			const collections = Object.keys(cheshireCat.currentMemory.collections)
			if (!collections.includes(id)) { return rep.notFound('Collection not found.') }
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

	fastify.delete<{
		Params: { collectionId: string }
		Body: {
			metadata: Record<string, any>
		}
	}>('/collections/:collectionId/points', { schema: {
		description: 'Delete points in memory by filter.',
		tags: ['Memory'],
		summary: 'Wipe memory points by metadata',
		params: {
			type: 'object',
			properties: {
				collectionId: { type: 'string' },
			},
		},
		body: {
			type: 'object',
			properties: {
				metadata: { type: 'object' },
			},
		},
		response: {
			204: { description: 'The collection\'s points was wiped successfully.', type: 'null' },
			404: { $ref: 'HttpError' },
			500: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const id = req.params.collectionId
		const metadata = req.body.metadata
		try {
			const collections = Object.keys(cheshireCat.currentMemory.collections)
			if (!collections.includes(id)) { return rep.notFound('Collection not found.') }
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
	}>('/collections/:collectionId/points/:memoryId', { schema: {
		description: 'Delete a specific point in memory.',
		tags: ['Memory'],
		summary: 'Wipe memory point',
		params: {
			type: 'object',
			properties: {
				collectionId: { type: 'string' },
				pointId: { type: 'string' },
			},
		},
		response: {
			204: { description: 'The point was wiped successfully.', type: 'null' },
			404: { $ref: 'HttpError' },
			500: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const { collectionId, pointId } = req.params
		try {
			const collections = Object.keys(cheshireCat.currentMemory.collections)
			if (!collections.includes(collectionId)) { return rep.notFound('Collection not found.') }
			const points = await cheshireCat.currentMemory.db.retrieve(collectionId, { ids: [pointId] })
			if (points.length === 0) { return rep.notFound('Point not found.') }
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
		tags: ['Memory'],
		summary: 'Get conversation history',
		response: {
			200: {
				type: 'object',
				properties: {
					history: { type: 'array', items: { type: 'object' } },
				},
			},
		},
	} }, (req) => {
		return {
			history: req.stray.getHistory(),
		}
	})

	fastify.delete('/conversation-history', { schema: {
		description: 'Delete the specified user\'s conversation history from working memory.',
		tags: ['Memory'],
		summary: 'Wipe conversation history',
		response: {
			204: { description: 'The conversation history was wiped successfully.', type: 'null' },
		},
	} }, (req) => {
		req.stray.clearHistory()
	})

	done()
}
