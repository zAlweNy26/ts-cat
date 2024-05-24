import type { VectorMemoryCollection } from '@memory/vector-memory-collection.ts'
import type { Schemas } from '@qdrant/js-client-rest'

export type Filter = Schemas['Filter']

export type FilterCondition = Schemas['FieldCondition']

export type FilterMatch = FilterCondition['match']

export type PointData = Schemas['PointStruct']

export type EmbeddedVector = Schemas['NamedVectorStruct']

/**
 * The configuration of a vector memory.
 */
export interface VectorMemoryConfig {
	embedderName: string
	embedderSize: number
}

/**
 * The configurations for each vector memory.
 */
export interface VectorMemoryCollections {
	episodic: VectorMemoryCollection
	declarative: VectorMemoryCollection
	procedural: VectorMemoryCollection
	[key: string]: VectorMemoryCollection
}

/**
 * The accepted JSON format for an imported memory.
 */
export interface MemoryJson {
	embedder: string
	collections: {
		declarative: PointData[]
		procedural: PointData[]
		episodic: PointData[]
		[key: string]: PointData[]
	}
}
