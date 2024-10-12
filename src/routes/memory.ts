import type { MemoryDocument } from '@dto/message.ts'
import type { FilterMatch } from '@dto/vector-memory.ts'
import { serverContext, swaggerTags } from '@/context'
import { cheshireCat as cat } from '@lg/cheshire-cat.ts'
import { Elysia, t } from 'elysia'

export const memoryRoutes = new Elysia({
	name: 'memory',
	prefix: '/memory',
	detail: { tags: [swaggerTags.memory.name] },
}).use(serverContext).get('/recall', async ({ query, stray, log, db, HttpError }) => {
	const { text, k } = query
	const userId = stray.userId

	const queryEmbedding = await cat.currentEmbedder.embedQuery(text)
	const recalled: Record<string, MemoryDocument[]> = {}

	for (const collection of Object.values(cat.vectorMemory.collections)) {
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
			throw HttpError.InternalServer('Error recalling memories.')
		}
	}

	return {
		query: {
			text,
			vector: queryEmbedding,
		},
		vectors: {
			embedder: db.data.selectedEmbedder,
			collections: recalled,
		},
	}
}, {
	detail: {
		description: 'Search k memories similar to given text.',
		summary: 'Recall memories',
	},
	query: t.Object({
		text: t.String(),
		k: t.Number({ default: 10 }),
	}),
	response: {
		200: t.Object({
			query: t.Object({
				text: t.String(),
				vector: t.Array(t.Number()),
			}),
			vectors: t.Object({
				embedder: t.String(),
				collections: t.Record(t.String(), t.Array(t.Object({
					id: t.String(),
					vector: t.Array(t.Number()),
					score: t.Number(),
					pageContent: t.String(),
					metadata: t.Optional(t.Record(t.String(), t.Any())),
				}))),
			}, {
				examples: [{
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
				}],
			}),
		}),
		500: 'error',
	},
}).get('/collections', async () => {
	const collections = Object.keys(cat.vectorMemory.collections)
	const infos = []
	for (const collection of collections) {
		const info = await cat.vectorMemory.db.getCollection(collection)
		infos.push({
			name: collection,
			size: info.points_count ?? 0,
		})
	}
	return {
		collections: infos,
	}
}, {
	detail: {
		description: 'Get list of available collections.',
		summary: 'Get collections',
	},
	response: {
		200: t.Object({
			collections: t.Array(t.Object({
				name: t.String(),
				size: t.Number(),
			})),
		}, {
			examples: [{
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
			}],
		}),
		500: 'error',
	},
}).delete('/collections', async ({ mh, log, HttpError }) => {
	try {
		const collections = Object.keys(cat.vectorMemory.collections)
		for (const collection of collections) await cat.vectorMemory.db.deleteCollection(collection)
		await cat.loadMemory()
		await mh.findPlugins()
	}
	catch (error) {
		log.error(error)
		throw HttpError.InternalServer('Error while wiping collections.')
	}
}, {
	detail: {
		description: 'Delete and recreate all the collections.',
		summary: 'Wipe collections',
	},
	response: {
		204: t.Void(),
		500: 'error',
	},
}).delete('/collections/:collectionId', async ({ mh, params, log, HttpError }) => {
	const id = params.collectionId
	try {
		const collections = Object.keys(cat.vectorMemory.collections)
		if (!collections.includes(id)) throw HttpError.NotFound('Collection not found.')
		await cat.vectorMemory.db.deleteCollection(id)
		await cat.loadMemory()
		await mh.findPlugins()
	}
	catch (error) {
		log.error(error)
		throw HttpError.InternalServer(`Error while wiping "${id}" collection.`)
	}
}, {
	detail: {
		description: 'Delete and recreate the specified collection.',
		summary: 'Wipe single collection',
	},
	params: t.Object({
		collectionId: t.String(),
	}),
	response: {
		204: t.Void(),
		404: 'error',
		500: 'error',
	},
}).post('/collections/:collectionId/documents', async ({ params, query, body, log, HttpError }) => {
	const id = params.collectionId, limit = query.k
	try {
		const collections = Object.keys(cat.vectorMemory.collections)
		if (!collections.includes(id)) throw HttpError.NotFound('Collection not found.')
		const points = await cat.vectorMemory.collections[id]!.getAllPoints(limit, body)
		return {
			documents: points.map(p => ({ ...p.payload as {
				id: string
				pageContent: string
				metadata: Record<string, any>
			}, id: p.id.toString() })),
		}
	}
	catch (error) {
		log.error(error)
		throw HttpError.InternalServer(`Error while retrieving "${id}" collection's documents.`)
	}
}, {
	detail: {
		description: 'Get list of documents of a specific collection, filtered by metadata.',
		summary: 'Get documents',
		externalDocs: {
			description: 'Metadata filtering conditions',
			url: 'https://qdrant.tech/documentation/concepts/filtering/#filtering-conditions',
		},
	},
	params: t.Object({ collectionId: t.String() }),
	query: t.Object({
		k: t.Number({ default: 10 }),
	}),
	body: t.Record(t.String(), t.Any(), {
		examples: [{
			source: {
				any: ['user'],
			},
		}],
	}),
	response: {
		200: t.Object({
			documents: t.Array(t.Object({
				id: t.String(),
				pageContent: t.String(),
				metadata: t.Record(t.String(), t.Any(), {
					examples: [{
						source: 'pizza-form',
						trigger: 'description',
						type: 'form',
						when: 1712950292521,
					}],
				}),
			})),
		}),
		404: 'error',
		500: 'error',
	},
}).delete('/collections/:collectionId/documents', async ({ params, body, log, HttpError }) => {
	const id = params.collectionId
	try {
		const collections = Object.keys(cat.vectorMemory.collections)
		if (!collections.includes(id)) throw HttpError.NotFound('Collection not found.')
		await cat.vectorMemory.collections[id]!.deletePointsByMetadata(body)
	}
	catch (error) {
		log.error(error)
		throw HttpError.InternalServer(`Error while wiping "${id}" collection's documents.`)
	}
}, {
	detail: {
		description: 'Delete documents in memory by filter.',
		summary: 'Wipe documents',
		externalDocs: {
			description: 'Metadata filtering conditions',
			url: 'https://qdrant.tech/documentation/concepts/filtering/#filtering-conditions',
		},
	},
	params: t.Object({ collectionId: t.String() }),
	body: t.Record(t.String(), t.Any(), {
		examples: [{
			source: {
				any: ['user'],
			},
		}],
	}),
	response: {
		204: t.Void(),
		404: 'error',
		500: 'error',
	},
}).delete('/collections/:collectionId/point/:pointId', async ({ params, log, HttpError }) => {
	const { collectionId, pointId } = params
	try {
		const collections = Object.keys(cat.vectorMemory.collections)
		if (!collections.includes(collectionId)) throw HttpError.NotFound('Collection not found.')
		const points = await cat.vectorMemory.db.retrieve(collectionId, { ids: [pointId] })
		if (points.length === 0) throw HttpError.NotFound('Point not found.')
		await cat.vectorMemory.collections[collectionId]?.deletePoints([pointId])
	}
	catch (error) {
		log.error(error)
		throw HttpError.InternalServer(`Error while wiping "${collectionId}" collection's point ${pointId}.`)
	}
}, {
	detail: {
		description: 'Delete a specific point in memory.',
		summary: 'Wipe memory point',
	},
	params: t.Object({
		collectionId: t.String(),
		pointId: t.String(),
	}),
	response: {
		204: t.Void(),
		404: 'error',
		500: 'error',
	},
}).get('/collections/:collectionId/point/:pointId', async ({ params, log, HttpError }) => {
	const { collectionId, pointId } = params
	try {
		const points = await cat.vectorMemory.collections[collectionId]!.getPoints([pointId])
		if (points.length === 0) throw HttpError.NotFound('Point not found.')
		return {
			id: points[0]!.id.toString(),
			vector: points[0]!.vector as number[] ?? [],
			payload: points[0]!.payload ?? {},
		}
	}
	catch (error) {
		log.error(error)
		throw HttpError.InternalServer(`Error while retrieving point ${pointId}.`)
	}
}, {
	detail: {
		description: 'Get a specific point in memory.',
		summary: 'Get memory point',
	},
	params: t.Object({
		collectionId: t.String(),
		pointId: t.String(),
	}),
	response: {
		200: t.Object({
			id: t.String(),
			vector: t.Array(t.Number()),
			payload: t.Record(t.String(), t.Any()),
		}),
		404: 'error',
		500: 'error',
	},
}).get('/history', ({ stray }) => {
	return {
		history: stray.getHistory(),
	}
}, {
	detail: {
		description: 'Get the specified user\'s conversation history from working memory.',
		summary: 'Get conversation history',
	},
	response: {
		200: t.Object({
			history: t.Array(t.Object({
				what: t.String(),
				who: t.String(),
				when: t.Number(),
				why: t.Optional(t.Object({
					input: t.String(),
					intermediateSteps: t.Array(t.Object({
						tool: t.String(),
						input: t.Union([t.String(), t.Null()]),
						observation: t.String(),
					})),
					memory: t.Optional(t.Record(t.String(), t.Any())),
					interactions: t.Optional(t.Record(t.String(), t.Any())),
				})),
			})),
		}),
	},
}).delete('/history', ({ stray }) => {
	stray.clearHistory()
}, {
	detail: {
		description: 'Delete the specified user\'s conversation history from working memory.',
		summary: 'Wipe conversation history',
	},
	response: {
		204: t.Void(),
	},
}).put('/history', ({ stray, body }) => {
	stray.addHistory(body)
}, {
	detail: {
		description: 'Add conversation history messages to the specified user\'s working memory.',
		summary: 'Add conversation history messages',
	},
	body: t.Array(t.Object({
		role: t.Union([t.Literal('AI'), t.Literal('User')]),
		what: t.String(),
		who: t.String(),
		when: t.Number(),
	})),
	response: {
		204: t.Void(),
	},
})
