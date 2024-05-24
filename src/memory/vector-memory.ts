import { QdrantClient } from '@qdrant/js-client-rest'
import { parsedEnv } from '@utils'
import { madHatter } from '@mh'
import { log } from '@logger'
import type { VectorMemoryCollections, VectorMemoryConfig } from '@dto/vector-memory.ts'
import { VectorMemoryCollection } from './vector-memory-collection.ts'

const { qdrantApiKey, qdrantHost, qdrantPort, secure } = parsedEnv

export const vectorDb = new QdrantClient({
	host: qdrantHost,
	port: qdrantPort,
	apiKey: qdrantApiKey,
	https: secure,
})

export class VectorMemory {
	private static instance: VectorMemory
	private vectorDb: QdrantClient
	collections!: VectorMemoryCollections

	private constructor() {
		this.vectorDb = vectorDb
	}

	/**
	 * Get the Vector Memory instance
	 * @returns The Vector Memory class as a singleton
	 */
	static async getInstance(params: VectorMemoryConfig) {
		if (!VectorMemory.instance) {
			log.silent('Initializing the Vector Memory...')
			VectorMemory.instance = new VectorMemory()
		}
		await VectorMemory.instance.initCollections(params)
		return VectorMemory.instance
	}

	private async initCollections(params: VectorMemoryConfig) {
		const { embedderName, embedderSize } = params
		this.collections = {
			declarative: await VectorMemoryCollection.create('declarative', embedderName, embedderSize),
			episodic: await VectorMemoryCollection.create('episodic', embedderName, embedderSize),
			procedural: await VectorMemoryCollection.create('procedural', embedderName, embedderSize),
			...madHatter.executeHook('memoryCollections', {}),
		}
	}

	/**
	 * Gets the vector database.
	 */
	get db() {
		return this.vectorDb
	}
}

export const getVectorMemory = async (params: VectorMemoryConfig) => await VectorMemory.getInstance(params)
