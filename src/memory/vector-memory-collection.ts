import { join } from 'node:path'
import { lstatSync, mkdirSync, renameSync, writeFileSync } from 'node:fs'
import type { Schemas } from '@qdrant/js-client-rest'
import { randomUUID } from 'uncrypto'
import { ofetch } from 'ofetch'
import type { MemoryDocument } from '@lg'
import { parsedEnv } from '@utils'
import { log } from '@logger'
import { vectorDb } from './vector-memory.ts'

export type Filter = Schemas['Filter']

export type FilterCondition = Schemas['FieldCondition']

export type FilterMatch = FilterCondition['match']

export type PointData = Schemas['PointStruct']

export type EmbeddedVector = Schemas['NamedVectorStruct']

export class VectorMemoryCollection {
	private constructor(public name: string, public embedderName: string, public embedderSize: number) {}

	/**
	 * Creates a new VectorMemoryCollection with the specified name, embedder name, and embedder size.
	 * If a collection with the same name already exists, it skips the creation step.
	 * If the existing collection has a different size, it updates the collection by deleting and recreating it.
	 * @param name The name of the collection.
	 * @param embedderName The name of the embedder.
	 * @param embedderSize The size of the embedder.
	 * @returns The created VectorMemoryCollection.
	 */
	static async create(name: string, embedderName: string, embedderSize: number) {
		const collection = new VectorMemoryCollection(name, embedderName, embedderSize)
		try {
			const collections = (await vectorDb.getCollections()).collections
			const hasCollection = collections.some(c => c.name === name)
			if (hasCollection) { log.debug(`Collection ${name} already exists. Skipping creation...`) }
			else await collection.createCollection()
			const collectionVectors = (await vectorDb.getCollection(name)).config.params.vectors
			const collectionSize = typeof collectionVectors?.size === 'number' ? collectionVectors.size : collectionVectors?.size?.size
			if (collectionSize !== collection.embedderSize) {
				log.debug(`Collection ${name} has the wrong size. Updating...`)
				const { saveMemorySnapshots } = parsedEnv
				if (saveMemorySnapshots) { await collection.saveDump() }
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
	 * @returns A promise that resolves when the collection is created.
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

	async saveDump(folder = 'dormouse/') {
		const { qdrantHost, qdrantPort, qdrantApiKey } = parsedEnv
		if (!qdrantApiKey) {
			log.error('Qdrant API key not found. Skipping dump...')
			return
		}
		log.warn(`Saving "${this.name}" collection dump...`)
		const stats = lstatSync(folder)
		if (stats.isDirectory()) { log.info('Directory dormouse exists') }
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

	private filterFromDict(filter: Record<string, FilterMatch>): Filter | undefined {
		if (Object.keys(filter).length === 0) { return undefined }
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
	addPoint(content: string, vector: number[], metadata?: Record<string, any>, id?: ReturnType<typeof randomUUID>, ...args: Parameters<typeof vectorDb.upsert>['1'][]) {
		return vectorDb.upsert(this.name, {
			points: [{
				id: id ?? randomUUID(),
				vector,
				payload: {
					pageContent: content,
					metadata,
				},
			}],
			...args,
		})
	}

	addPoints(points: PointData[]) {
		return vectorDb.upsert(this.name, {
			points,
		})
	}

	/**
	 * Delete points by their metadata.
	 * @param metadata the metadata of the points to delete.
	 * @returns the result of the deletion.
	 */
	deletePointsByMetadata(metadata: Record<string, FilterMatch>) {
		const filter = this.filterFromDict(metadata)
		if (!filter) { return undefined }
		return vectorDb.delete(this.name, {
			filter,
		})
	}

	/**
	 * Delete points by their ids.
	 * @param ids the ids of the points to delete.
	 * @returns the result of the deletion.
	 */
	deletePoints(ids: string[]) {
		return vectorDb.delete(this.name, {
			points: ids,
		})
	}

	async recallMemoriesFromEmbedding(embedding: EmbeddedVector, filter?: Record<string, FilterMatch>, k = 5, threshold?: number) {
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
