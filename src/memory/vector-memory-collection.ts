import { join } from 'node:path'
import { lstatSync, mkdirSync, renameSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'uncrypto'
import { ofetch } from 'ofetch'
import { parsedEnv } from '@utils'
import { log } from '@logger'
import type { EmbeddedVector, Filter, FilterCondition, FilterMatch, PointData } from '@dto/vector-memory.ts'
import type { MemoryDocument } from '@dto/message.ts'
import { vectorDb } from './vector-memory.ts'

export class VectorMemoryCollection {
	private constructor(public name: string, public embedderName: string, public embedderSize: number) {}

	/**
	 * Creates a new VectorMemoryCollection with the specified name, embedder name, and embedder size.
	 * If a collection with the same name already exists, it skips the creation step.
	 * If the existing collection has a different size, it updates the collection by deleting and recreating it.
	 * @param name The name of the collection.
	 * @param embedderName The name of the embedder.
	 * @param embedderSize The size of the embedder.
	 * @returns The created {@link VectorMemoryCollection}.
	 */
	static async create(name: string, embedderName: string, embedderSize: number) {
		const collection = new VectorMemoryCollection(name, embedderName, embedderSize)
		try {
			const collections = (await vectorDb.getCollections()).collections
			const hasCollection = collections.some(c => c.name === name)
			if (hasCollection) log.debug(`Collection ${name} already exists. Skipping creation...`)
			else await collection.createCollection()
			const collectionVectors = (await vectorDb.getCollection(name)).config.params.vectors
			const collectionSize = typeof collectionVectors?.size === 'number' ? collectionVectors.size : collectionVectors?.size?.size
			if (collectionSize !== collection.embedderSize) {
				log.debug(`Collection ${name} has the wrong size. Updating...`)
				const { saveMemorySnapshots } = parsedEnv
				if (saveMemorySnapshots) await collection.saveDump()
				await vectorDb.deleteCollection(name)
				log.warn(`Collection ${name} deleted. Recreating...`)
				await collection.createCollection()
			}
		}
		catch (error) {
			log.error('Failed to connect to the Vector Memory Database')
			process.exit()
		}
		return collection
	}

	/**
	 * Creates a new collection with the specified configuration.
	 */
	async createCollection() {
		log.info(`Creating "${this.name}" collection...`)
		await vectorDb.recreateCollection(this.name, {
			vectors: {
				size: this.embedderSize,
				distance: 'Cosine',
			},
			optimizers_config: {
				memmap_threshold: 20000,
			},
			quantization_config: {
				scalar: {
					type: 'int8',
					quantile: 0.95,
					always_ram: true,
				},
			},
			// shard_number: 3
		})
		await vectorDb.updateCollectionAliases({
			actions: [
				{
					create_alias: {
						collection_name: this.name,
						alias_name: `${this.embedderName}_${this.name}`,
					},
				},
			],
		})
	}

	/**
	 * Saves the collection dump to a specified folder.
	 * @param folder The folder path where the dump will be saved. Defaults to 'dormouse/'.
	 */
	async saveDump(folder = 'dormouse/') {
		const { qdrantHost, qdrantPort, qdrantApiKey } = parsedEnv
		if (!qdrantApiKey) {
			log.error('Qdrant API key not found. Skipping dump...')
			return
		}
		log.warn(`Saving "${this.name}" collection dump...`)
		const stats = lstatSync(folder)
		if (stats.isDirectory()) log.info('Directory dormouse exists')
		else {
			log.warn('Creating dormouse directory...')
			mkdirSync(folder)
		}
		const snapshot = await vectorDb.createSnapshot(this.name)
		if (!snapshot) {
			log.error('Failed to create snapshot. Skipping dump...')
			return
		}
		const remoteSnap = `http://${qdrantHost}:${qdrantPort}/collections/${this.name}/snapshots/${snapshot.name}`
		const dumpDir = join(folder, snapshot.name)
		const collectionAlias = await vectorDb.getCollectionAliases(this.name)
		const aliasName = collectionAlias.aliases[0]?.alias_name ?? `${this.embedderName}_${this.name}`
		const res = await ofetch<string>(remoteSnap)
		writeFileSync(dumpDir, res)
		const newName = join(folder, aliasName.replaceAll('/', '_').concat('.snapshot'))
		renameSync(dumpDir, newName)
		const snapshots = await vectorDb.listSnapshots(this.name)
		snapshots.forEach(async snap => vectorDb.deleteSnapshot(this.name, snap.name))
		log.info(`Dump ${newName} saved successfully`)
	}

	/**
	 * Filters the dictionary based on the provided filter object.
	 * @param filter The filter object containing key-value pairs to match against.
	 * @returns The constructed filter object or undefined if the filter is empty.
	 */
	private filterFromDict(filter: Record<string, FilterMatch>): Filter | undefined {
		if (Object.keys(filter).length === 0) return undefined
		return {
			must: Object.entries(filter).reduce((acc, [key, match]) =>
				acc.concat({ key, match }), [] as FilterCondition[]),
		}
	}

	/**
	 * Add a point (and its metadata) to the vector store.
	 * @param content Original content to push.
	 * @param vector The embedding vector.
	 * @param metadata Optional metadata associated with the content.
	 * @param id id to associate with the point. It has to be a UUID-like string.
	 * @param args Optional arguments to pass.
	 * @returns The id of the added point.
	 */
	async addPoint(content: string, vector: number[], metadata?: Record<string, any>, id = randomUUID(), ...args: Parameters<typeof vectorDb.upsert>['1'][]) {
		const point: PointData = {
			id: id ?? randomUUID(),
			vector,
			payload: {
				pageContent: content,
				metadata,
			},
		}
		const res = await vectorDb.upsert(this.name, {
			points: [point],
			...args,
		})
		if (res.status === 'completed') return point
		else return undefined
	}

	/**
	 * Adds an array of points to the vector memory collection.
	 * @param points An array of {@link PointData} representing the points to be added.
	 * @returns The result of the upsert operation.
	 */
	addPoints(points: PointData[], ...args: Parameters<typeof vectorDb.upsert>['1'][]) {
		return vectorDb.upsert(this.name, { points, ...args })
	}

	/**
	 * Delete points by their metadata.
	 * @param metadata The metadata of the points to delete.
	 * @returns The result of the deletion.
	 */
	deletePointsByMetadata(metadata: Record<string, FilterMatch>) {
		const filter = this.filterFromDict(metadata)
		if (!filter) return undefined
		return vectorDb.delete(this.name, { filter })
	}

	/**
	 * Delete points by their IDs.
	 * @param ids The IDs of the points to delete.
	 * @returns The result of the deletion.
	 */
	deletePoints(ids: string[]) {
		return vectorDb.delete(this.name, {
			points: ids,
		})
	}

	/**
	 * Retrieves memories from the vector database based on an embedded vector.
	 * @param embedding The embedding vector to search for.
	 * @param filter Optional filter to apply to the search.
	 * @param k The maximum number of memories to retrieve (default: 10).
	 * @param threshold The score threshold for retrieved memories.
	 * @returns An array of {@link MemoryDocument} representing the retrieved memories.
	 */
	async recallMemoriesFromEmbedding(embedding: EmbeddedVector, filter?: Record<string, FilterMatch>, k = 10, threshold?: number) {
		const memories = await vectorDb.search(this.name, {
			vector: embedding,
			filter: filter ? this.filterFromDict(filter) : undefined,
			with_payload: true,
			with_vector: true,
			limit: k,
			score_threshold: threshold,
			params: {
				quantization: {
					ignore: false,
					rescore: true,
					oversampling: 2.0,
				},
			},
		})

		const documents: MemoryDocument[] = []
		for (const memory of memories) {
			documents.push({
				id: memory.id.toString(),
				score: memory.score,
				vector: memory.vector as EmbeddedVector,
				pageContent: (memory.payload?.pageContent as string),
				metadata: (memory.payload?.metadata as Record<string, any>),
			})
		}

		return documents
	}

	/**
	 * Retrieves all points from the vector memory collection.
	 * @param limit The maximum number of points to retrieve (default: 10000).
	 * @param filter An optional filter to apply to the points.
	 * @returns An array of {@link PointData}.
	 */
	async getAllPoints(limit = 10000, filter?: Record<string, FilterMatch>) {
		const list = await vectorDb.scroll(this.name, {
			filter: filter ? this.filterFromDict(filter) : undefined,
			with_vector: true,
			with_payload: true,
			limit,
		})

		return list.points as PointData[]
	}
}
