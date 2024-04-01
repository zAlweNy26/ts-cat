import { QdrantClient } from '@qdrant/js-client-rest'
import { parsedEnv } from '@utils'
import { madHatter } from '@mh'
import { log } from '@logger'
import { VectorMemoryCollection } from './vector-memory-collection.ts'

export interface VectorMemoryConfig {
	embedderName: string
	embedderSize: number
}

export interface VectorMemoryCollections {
	episodic: VectorMemoryCollection
	declarative: VectorMemoryCollection
	procedural: VectorMemoryCollection
	[key: string]: VectorMemoryCollection
}

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

	private constructor(private params: VectorMemoryConfig) {
		this.vectorDb = vectorDb
	}

	static async getInstance(params: VectorMemoryConfig) {
		if (!VectorMemory.instance) {
			log.silent('Initializing the Vector Memory...')
			VectorMemory.instance = new VectorMemory(params)
		}
		await VectorMemory.instance.initCollections()
		return VectorMemory.instance
	}

	private async initCollections() {
		const { embedderName, embedderSize } = this.params
		this.collections = {
			declarative: await VectorMemoryCollection.create('declarative', embedderName, embedderSize),
			episodic: await VectorMemoryCollection.create('episodic', embedderName, embedderSize),
			procedural: await VectorMemoryCollection.create('procedural', embedderName, embedderSize),
			...madHatter.executeHook('memoryCollections', {}),
		}
	}

	get db() {
		return this.vectorDb
	}
}

export const getVectorMemory = async (params: VectorMemoryConfig) => await VectorMemory.getInstance(params)
