import type { MemoryDocument } from '@dto/message.ts'
import type { FilterMatch } from '@dto/vector-memory.ts'
import { memoryMessage, serverContext, swaggerTags } from '@/context'
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
		text: t.String({ title: 'Text', description: 'Text to search for' }),
		k: t.Number({ title: 'K', description: 'Number of memories to extract', default: 10 }),
	}),
	response: {
		200: 'memoryRecall',
		400: 'error',
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
			title: 'Collections',
			description: 'List of available collections and their sizes',
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
		400: 'error',
		500: 'error',
	},
}).delete('/collections', async ({ mh, log, HttpError, set }) => {
	try {
		const collections = Object.keys(cat.vectorMemory.collections)
		for (const collection of collections) await cat.vectorMemory.db.deleteCollection(collection)
		await cat.loadMemory()
		await mh.findPlugins()
		set.status = 204
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
		204: t.Void({ title: 'Collections wiped', description: 'Collections wiped successfully' }),
		400: 'error',
		500: 'error',
	},
}).delete('/collections/:collectionId', async ({ mh, params, log, HttpError, set }) => {
	const id = params.collectionId
	try {
		const collections = Object.keys(cat.vectorMemory.collections)
		if (!collections.includes(id)) throw HttpError.NotFound('Collection not found.')
		await cat.vectorMemory.db.deleteCollection(id)
		await cat.loadMemory()
		await mh.findPlugins()
		set.status = 204
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
		collectionId: t.String({ title: 'Collection ID', description: 'ID of the collection to wipe' }),
	}),
	response: {
		204: t.Void({ title: 'Collection wiped', description: 'Collection wiped successfully' }),
		400: 'error',
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
	params: t.Object({ collectionId: t.String({ title: 'Collection ID', description: 'ID of the collection from which to get the documents' }) }),
	query: t.Object({
		k: t.Number({ title: 'K', description: 'Number of documents to retrieve', default: 10 }),
	}),
	body: t.Record(t.String(), t.Any(), {
		title: 'Metadata filter',
		description: 'Filter documents by metadata',
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
		}, {
			title: 'Documents',
			description: 'List of documents in the collection',
			examples: [{
				documents: [
					{
						id: '1da746f8-a832-4a45-a120-4549e17a1df7',
						pageContent: 'Hello, John!',
						metadata: {
							source: 'user',
						},
					},
					{
						id: '1da746f8-a832-4a45-a120-4549e17a1df8',
						pageContent: 'Hello, Jane!',
						metadata: {
							source: 'user',
						},
					},
				],
			}],
		}),
		400: 'error',
		404: 'error',
		500: 'error',
	},
}).delete('/collections/:collectionId/documents', async ({ params, body, log, HttpError, set }) => {
	const id = params.collectionId
	try {
		const collections = Object.keys(cat.vectorMemory.collections)
		if (!collections.includes(id)) throw HttpError.NotFound('Collection not found.')
		await cat.vectorMemory.collections[id]!.deletePointsByMetadata(body)
		set.status = 204
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
	params: t.Object({ collectionId: t.String({ title: 'Collection ID', description: 'ID of the collection whose documents must be wiped' }) }),
	body: t.Record(t.String(), t.Any(), {
		examples: [{
			source: {
				any: ['user'],
			},
		}],
	}),
	response: {
		204: t.Void({ title: 'Documents wiped', description: 'Documents wiped successfully' }),
		400: 'error',
		404: 'error',
		500: 'error',
	},
}).delete('/collections/:collectionId/point/:pointId', async ({ params, log, HttpError, set }) => {
	const { collectionId, pointId } = params
	const collections = Object.keys(cat.vectorMemory.collections)
	if (!collections.includes(collectionId)) throw HttpError.NotFound('Collection not found.')
	try {
		const points = await cat.vectorMemory.db.retrieve(collectionId, { ids: [pointId] })
		if (points.length === 0) throw HttpError.NotFound('Point not found.')
		await cat.vectorMemory.collections[collectionId]?.deletePoints([pointId])
		set.status = 204
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
		collectionId: t.String({ title: 'Collection ID', description: 'ID of the collection whose point must be deleted' }),
		pointId: t.String({ title: 'Point ID', description: 'ID of the point to delete' }),
	}),
	response: {
		204: t.Void({ title: 'Point wiped', description: 'Point wiped successfully' }),
		400: 'error',
		404: 'error',
		500: 'error',
	},
}).get('/collections/:collectionId/point/:pointId', async ({ params, log, HttpError }) => {
	const { collectionId, pointId } = params
	const collections = Object.keys(cat.vectorMemory.collections)
	if (!collections.includes(collectionId)) throw HttpError.NotFound('Collection not found.')
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
		collectionId: t.String({ title: 'Collection ID', description: 'ID of the collection from which to get the point' }),
		pointId: t.String({ title: 'Point ID', description: 'ID of the point to retrieve' }),
	}),
	response: {
		200: t.Object({
			id: t.String(),
			vector: t.Array(t.Number()),
			payload: t.Record(t.String(), t.Any()),
		}, {
			title: 'Memory Point',
			description: 'Point in memory',
			examples: [{
				id: '1da746f8-a832-4a45-a120-4549e17a1df7',
				vector: [0.1, 0.2, 0.3],
				payload: {
					source: 'user',
				},
			}],
		}),
		400: 'error',
		404: 'error',
		500: 'error',
	},
}).post('/collections/:collectionId/point', async ({ params, body, log, HttpError }) => {
	const { collectionId } = params, { content, payload, vector } = body
	const collections = Object.keys(cat.vectorMemory.collections)
	if (!collections.includes(collectionId)) throw HttpError.NotFound('Collection not found.')
	try {
		const point = await cat.vectorMemory.collections[collectionId]!.addPoint(content, vector, payload)
		if (!point) throw new Error('Error adding point.')
		return {
			id: point.id.toString(),
		}
	}
	catch (error) {
		log.error(error)
		throw HttpError.InternalServer('Unable to add point in memory.')
	}
}, {
	detail: {
		description: 'Add a point in memory.',
		summary: 'Add memory point',
	},
	body: t.Object({
		content: t.String({ title: 'Content', description: 'Content of the point' }),
		vector: t.Array(t.Number(), { title: 'Vector', description: 'Vector of the point' }),
		payload: t.Record(t.String(), t.Any(), { title: 'Payload', description: 'Metadata of the point' }),
	}, {
		title: 'Memory Point',
		description: 'Point to add in memory',
		examples: [{
			content: 'Hello, John!',
			vector: [0.1, 0.2, 0.3],
			payload: {
				source: 'user',
			},
		}],
	}),
	params: t.Object({
		collectionId: t.String({ title: 'Collection ID', description: 'ID of the collection to add the point to' }),
	}),
	response: {
		200: t.Object({
			id: t.String(),
		}, {
			title: 'Memory Point',
			description: 'Point added in memory',
			examples: [{
				id: '1da746f8-a832-4a45-a120-4549e17a1df7',
			}],
		}),
		400: 'error',
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
		200: 'chatHistory',
		400: 'error',
	},
}).delete('/history', ({ stray, set }) => {
	stray.clearHistory()
	set.status = 204
}, {
	detail: {
		description: 'Delete the specified user\'s conversation history from working memory.',
		summary: 'Wipe conversation history',
	},
	response: {
		204: t.Void({ title: 'History wiped', description: 'History wiped successfully' }),
		400: 'error',
	},
}).put('/history', ({ stray, body, set }) => {
	stray.addHistory(body.history)
	set.status = 204
}, {
	detail: {
		description: 'Add conversation history messages to the specified user\'s working memory.',
		summary: 'Add conversation history messages',
	},
	body: t.Object({
		history: t.Array(t.Omit(memoryMessage, ['why'])),
	}, {
		title: 'History Messages',
		description: 'History messages',
		examples: [{
			history: [
				{
					role: 'User',
					what: 'Hello, world!',
					when: 1712950292521,
					who: 'evi2734v',
				},
			],
		}],
	}),
	response: {
		204: t.Void({ title: 'History added', description: 'History added successfully' }),
		400: 'error',
	},
})
