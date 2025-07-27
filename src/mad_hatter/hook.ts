import type { DatabaseConfig } from '@db'
import type { AgentFastReply, ContextInput, InstantToolTrigger } from '@dto/agent.ts'
import type { EmbedderInteraction, MemoryMessage, MemoryRecallConfigs, Message, ModelInteraction, WorkingMemory, WSMessage } from '@dto/message.ts'
import type { ChatModelConfig, EmbedderConfig } from '@factory'
import type { Document } from '@langchain/core/documents'
import type { CheshireCat, StrayCat, StrayKitten } from '@lg'
import type { VectorMemoryCollection } from '@memory'
import type { FileParsers, WebParser } from '@rh'
import type { TextSplitter } from 'langchain/text_splitter'

export interface HookTypes {
	// Cheshire Cat hooks
	beforeBootstrap: (db: Readonly<DatabaseConfig>) => NotPromise<DatabaseConfig>
	afterBootstrap: (db: Readonly<DatabaseConfig>, cat: CheshireCat) => NotPromise<DatabaseConfig>
	allowedEmbedders: (embedders: EmbedderConfig[]) => MaybePromise<EmbedderConfig[]>
	allowedLLMs: (llms: ChatModelConfig[]) => MaybePromise<ChatModelConfig[]>
	// Agent Manager hooks
	agentPromptInstructions: (prompt: string, stray: StrayKitten) => MaybePromise<string>
	allowedTools: (tools: string[], stray: StrayKitten) => MaybePromise<string[]>
	beforeAgentStarts: (input: ContextInput, stray: StrayKitten) => MaybePromise<ContextInput>
	agentFastReply: (reply: Nullable<AgentFastReply>, stray: StrayKitten) => MaybePromise<Nullable<AgentFastReply>>
	agentPromptPrefix: (prefix: string, stray: StrayKitten) => MaybePromise<string>
	agentPromptSuffix: (suffix: string, stray: StrayKitten) => MaybePromise<string>
	afterProceduresChain: (output: AgentFastReply, stray: StrayKitten) => MaybePromise<AgentFastReply>
	afterMemoryChain: (output: AgentFastReply, stray: StrayKitten) => MaybePromise<AgentFastReply>
	instantToolTrigger: (input: Nullable<InstantToolTrigger>, stray: StrayKitten) => MaybePromise<Nullable<InstantToolTrigger>>
	// Stray Cat hooks
	recallQuery: (query: string, stray: StrayKitten) => MaybePromise<string>
	beforeReadMessage: (msg: Message, stray: StrayKitten) => MaybePromise<Message>
	beforeSendMessage: (msg: MemoryMessage, stray: StrayKitten) => MaybePromise<MemoryMessage>
	afterSendMessage: (msg: WSMessage, stray: StrayKitten) => MaybePromise<WSMessage>
	beforeStoreEpisodicMemory: (doc: Document, stray: StrayKitten) => MaybePromise<Document>
	beforeRecallMemories: (configs: MemoryRecallConfigs, stray: StrayKitten) => MaybePromise<MemoryRecallConfigs>
	afterRecallMemories: (memory: BetterReadonly<WorkingMemory>, stray: StrayKitten) => MaybePromise<BetterReadonly<WorkingMemory>>
	afterModelInteraction: (interaction: ModelInteraction, stray: StrayKitten) => MaybePromise<ModelInteraction>
	// Vector Memory hooks
	memoryCollections: (collections: Record<string, VectorMemoryCollection>) => MaybePromise<Record<string, VectorMemoryCollection>>
	// Rabbit Hole hooks
	fileParsers: (loaders: FileParsers) => MaybePromise<FileParsers>
	webParsers: (loaders: WebParser[]) => MaybePromise<WebParser[]>
	textSplitter: (splitter: TextSplitter) => MaybePromise<TextSplitter>
	beforeStoreDocuments: (docs: Document[], stray: StrayKitten | StrayCat) => MaybePromise<Document[]>
	afterStoreDocuments: (docs: Document[], stray: StrayKitten | StrayCat) => MaybePromise<Document[]>
	beforeInsertInMemory: (doc: Document, stray: StrayKitten | StrayCat) => MaybePromise<Document>
	afterInsertInMemory: (doc: Document, interaction: EmbedderInteraction, stray: StrayKitten | StrayCat) => MaybePromise<Document>
	beforeSplitDocs: (texts: Document[], stray: StrayKitten | StrayCat) => MaybePromise<Document[]>
	afterSplitDocs: (docs: Document[], stray: StrayKitten | StrayCat) => MaybePromise<Document[]>
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

export { ChatModelConfig, EmbedderConfig } from '@factory'
