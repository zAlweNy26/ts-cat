import type { DocumentInput } from '@langchain/core/documents'
import type { EmbeddedVector, FilterMatch } from './vector-memory.ts'

/**
 * The configuration for memory recall.
 */
export interface MemoryRecallConfig {
	embedding: number[]
	k: number
	threshold: number
	filter?: Record<string, FilterMatch>
}

/**
 * The configurations for each memory recall.
 */
export interface MemoryRecallConfigs {
	episodic: MemoryRecallConfig
	declarative: MemoryRecallConfig
	procedural: MemoryRecallConfig
	[key: string]: MemoryRecallConfig
}

/**
 * A memory document.
 */
export type MemoryDocument = {
	id: string
	vector: EmbeddedVector
	score: number
} & DocumentInput

/**
 * The working memory of the cat.
 */
export interface WorkingMemory {
	episodic: MemoryDocument[]
	declarative: MemoryDocument[]
	procedural: MemoryDocument[]
	[key: string]: MemoryDocument[]
}

/**
 * The content of a memory message.
 */
export interface MemoryMessage {
	what: string
	who: string
	when: number
	why?: {
		input: string
		intermediateSteps: Record<string, any>[]
		memory?: WorkingMemory
	}
}

/**
 * A message object sent by the user.
 */
export interface Message {
	text: string
	[key: string]: any
}

/**
 * A message object sent by the websocket.
 */
export type WSMessage = {
	type: 'error'
	name: string
	description: string
} | {
	type: 'token' | 'notification'
	content: string
} | ({
	type: 'chat'
} & MemoryMessage)
