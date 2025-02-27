import type { DocumentInput } from '@langchain/core/documents'
import type { IntermediateStep } from './agent.ts'
import type { FilterMatch } from './vector-memory.ts'

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
export type MemoryDocument = DocumentInput & {
	id: string
	vector: number[]
	score: number
}

/**
 * The working memory of the cat.
 */
export interface WorkingMemory {
	episodic: MemoryDocument[]
	declarative: MemoryDocument[]
	procedural: MemoryDocument[]
	[key: string]: MemoryDocument[]
}

export interface Interaction {
	source: string
	prompt: string
	outputTokens: number
	startedAt: number
	endedAt: number
}

export type LLMInteraction = Interaction & {
	model: 'llm'
	inputTokens: number
	reply: string
}

export type EmbedderInteraction = Interaction & {
	model: 'embedder'
	reply: number[]
}

export type ModelInteraction = LLMInteraction | EmbedderInteraction

/**
 * The content of a memory message.
 */
export type MemoryMessage = {
	role: 'AI' | 'User'
	what: string | File | Array<string | File>
	who: string
	when: number
} & ({
	role: 'AI'
	why?: {
		input: string
		intermediateSteps: IntermediateStep[]
		memory: WorkingMemory
		interactions: ModelInteraction[]
	}
} | {
	role: 'User'
})

/**
 * A message object sent by the user.
 */
export interface Message {
	text: string
	image?: string | File
	audio?: string | File
	video?: string | File
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
