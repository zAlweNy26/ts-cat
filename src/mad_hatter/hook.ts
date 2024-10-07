import type { DatabaseConfig } from '@db'
import type { AgentFastReply, ContextInput, InstantToolTrigger } from '@dto/agent.ts'
import type { EmbedderInteraction, MemoryMessage, MemoryRecallConfigs, Message, ModelInteraction, WSMessage } from '@dto/message.ts'
import type { addChatModel, addEmbeddings, ChatModelConfig, EmbedderConfig } from '@factory'
import type { Document } from '@langchain/core/documents'
import type { CheshireCat, StrayCat } from '@lg'
import type { VectorMemoryCollection } from '@memory'
import type { FileParsers, WebParser } from '@rh'
import type { TextSplitter } from 'langchain/text_splitter'

export interface HookTypes {
	// Cheshire Cat hooks
	afterBootstrap: (db: Readonly<DatabaseConfig>, cat: CheshireCat) => DatabaseConfig
	// Mad Hatter hooks
	beforeBootstrap: (db: Readonly<DatabaseConfig>) => DatabaseConfig
	allowedEmbedders: (embedders: EmbedderConfig[], addEmbedder: typeof addEmbeddings) => EmbedderConfig<TODO>[]
	allowedLLMs: (llms: ChatModelConfig[], addModel: typeof addChatModel) => ChatModelConfig<TODO>[]
	// Agent Manager hooks
	agentPromptInstructions: (prompt: string, stray: StrayCat) => MaybePromise<string>
	allowedTools: (tools: string[], stray: StrayCat) => MaybePromise<string[]>
	beforeAgentStarts: (input: ContextInput, stray: StrayCat) => MaybePromise<ContextInput>
	agentFastReply: (reply: Nullable<AgentFastReply>, stray: StrayCat) => MaybePromise<Nullable<AgentFastReply>>
	agentPromptPrefix: (prefix: string, stray: StrayCat) => MaybePromise<string>
	agentPromptSuffix: (suffix: string, stray: StrayCat) => MaybePromise<string>
	afterProceduresChain: (output: AgentFastReply, stray: StrayCat) => MaybePromise<AgentFastReply>
	afterMemoryChain: (output: AgentFastReply, stray: StrayCat) => MaybePromise<AgentFastReply>
	instantToolTrigger: (input: Nullable<InstantToolTrigger>, stray: StrayCat) => MaybePromise<Nullable<InstantToolTrigger>>
	// Stray Cat hooks
	recallQuery: (query: string, stray: StrayCat) => MaybePromise<string>
	beforeReadMessage: (msg: Message, stray: StrayCat) => MaybePromise<Message>
	beforeSendMessage: (msg: MemoryMessage, stray: StrayCat) => MaybePromise<MemoryMessage>
	afterSendMessage: (msg: WSMessage, stray: StrayCat) => MaybePromise<WSMessage>
	beforeStoreEpisodicMemory: (doc: Document, stray: StrayCat) => MaybePromise<Document>
	beforeRecallMemories: (configs: MemoryRecallConfigs, stray: StrayCat) => MaybePromise<MemoryRecallConfigs>
	afterRecallMemories: (stray: StrayCat) => MaybePromise<void>
	afterModelInteraction: (interaction: ModelInteraction, stray: StrayCat) => ModelInteraction
	// Vector Memory hooks
	memoryCollections: (collections: Record<string, VectorMemoryCollection>) => MaybePromise<Record<string, VectorMemoryCollection>>
	// Rabbit Hole hooks
	fileParsers: (loaders: FileParsers) => FileParsers
	webParsers: (loaders: WebParser[]) => WebParser[]
	textSplitter: (splitter: TextSplitter) => TextSplitter
	beforeStoreDocuments: (docs: Document[], stray: StrayCat) => MaybePromise<Document[]>
	afterStoreDocuments: (docs: Document[], stray: StrayCat) => MaybePromise<Document[]>
	beforeInsertInMemory: (doc: Document, stray: StrayCat) => MaybePromise<Document>
	afterInsertInMemory: (doc: Document, interaction: EmbedderInteraction, stray: StrayCat) => MaybePromise<Document>
	beforeSplitDocs: (texts: Document[], stray: StrayCat) => MaybePromise<Document[]>
	afterSplitDocs: (docs: Document[], stray: StrayCat) => MaybePromise<Document[]>
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
