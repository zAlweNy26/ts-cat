import type { Document } from '@langchain/core/documents'
import type { TextSplitter } from 'langchain/text_splitter'
import type { ChainValues } from '@langchain/core/utils/types'
import type { CheshireCat, StrayCat } from '@lg'
import type { EmbedderSettings, LLMSettings } from '@factory'
import type { VectorMemoryCollection } from '@memory'
import type { FileParsers, WebParser } from '@rh'
import type { AgentFastReply, ContextInput, InstantToolTrigger } from '@dto/agent.ts'
import type { MemoryMessage, MemoryRecallConfigs, Message } from '@/dtos/message.ts'

export interface HookTypes {
	// Cheshire Cat hooks
	beforeBootstrap: (cat: CheshireCat) => void
	afterBootstrap: (cat: CheshireCat) => void
	// Mad Hatter hooks
	allowedEmbedders: (embedders: EmbedderSettings[]) => EmbedderSettings[]
	allowedLLMs: (llms: LLMSettings[]) => LLMSettings[]
	// Agent Manager hooks
	agentPromptInstructions: (prompt: string, stray: StrayCat) => string
	allowedTools: (tools: string[], stray: StrayCat) => string[]
	beforeAgentStarts: (input: ContextInput, stray: StrayCat) => ContextInput
	agentFastReply: (reply: Nullable<AgentFastReply>, stray: StrayCat) => Nullable<AgentFastReply>
	agentPromptPrefix: (prefix: string, stray: StrayCat) => string
	agentPromptSuffix: (suffix: string, stray: StrayCat) => string
	afterProceduresChain: (output: ChainValues, stray: StrayCat) => ChainValues
	afterMemoryChain: (output: ChainValues, stray: StrayCat) => ChainValues
	instantToolTrigger: (input: Nullable<InstantToolTrigger>, stray: StrayCat) => Nullable<InstantToolTrigger>
	// Stray Cat hooks
	recallQuery: (query: string, stray: StrayCat) => string
	beforeReadMessage: (msg: Message, stray: StrayCat) => Message
	beforeSendMessage: (msg: MemoryMessage, stray: StrayCat) => MemoryMessage
	beforeStoreEpisodicMemory: (doc: Document, stray: StrayCat) => Document
	beforeRecallMemories: (configs: MemoryRecallConfigs, stray: StrayCat) => MemoryRecallConfigs
	afterRecallMemories: (stray: StrayCat) => void
	// Vector Memory hooks
	memoryCollections: (collections: Record<string, VectorMemoryCollection>) => Record<string, VectorMemoryCollection>
	// Rabbit Hole hooks
	fileParsers: (loaders: FileParsers) => FileParsers
	webParsers: (loaders: WebParser[]) => WebParser[]
	textSplitter: (splitter: TextSplitter) => TextSplitter
	beforeStoreDocuments: (docs: Document[], stray: StrayCat) => Document[]
	afterStoreDocuments: (docs: Document[], stray: StrayCat) => Document[]
	beforeInsertInMemory: (doc: Document, stray: StrayCat) => Document
	afterInsertInMemory: (doc: Document, stray: StrayCat) => Document
	beforeSplitDocs: (texts: Document[], stray: StrayCat) => Document[]
	afterSplitDocs: (docs: Document[], stray: StrayCat) => Document[]
}

interface HookOptions {
	priority?: number
}

export type HookNames = keyof HookTypes

export type Hook<T extends HookNames = HookNames> = {
	name: T
	fn: HookTypes[T]
	from: string
} & Required<HookOptions>

export type Hooks<H extends HookNames = HookNames> = {
	[K in H]: Array<Hook<H>>
}

export function isHook(hook: any): hook is Hook<HookNames> {
	return hook && typeof hook == 'object' && 'name' in hook && 'priority' in hook && 'fn' in hook
		&& 'from' in hook && typeof hook.name == 'string' && typeof hook.priority == 'number'
		&& typeof hook.from == 'string' && typeof hook.fn == 'function' && Object.keys(hook).length === 4
}

export const CatHook = Object.freeze({
	/**
	 * Add a hook to the plugin
	 * @param name the name of the hook
	 * @param fn the function to execute when the hook is called
	 * @param options the options of the hook
	 * @returns the hook instance
	 */
	add<T extends HookNames = HookNames>(name: T, fn: HookTypes[T], options?: HookOptions) {
		const { priority } = {
			priority: 0,
			...options,
		}
		const hook: Hook = {
			name,
			priority,
			fn,
			from: 'unknown',
		}
		return hook
	},
})
