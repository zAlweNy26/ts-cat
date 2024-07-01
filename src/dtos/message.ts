import type { DocumentInput } from '@langchain/core/documents'
import type { FilterMatch } from './vector-memory.ts'
import type { IntermediateStep } from './agent.ts'

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
	vector: number[]
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
	role: 'AI' | 'User'
	what: string
	who: string
	when: number
	why?: {
		input: string
		intermediateSteps: IntermediateStep[]
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
