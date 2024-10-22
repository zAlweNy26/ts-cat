[Overview](../index.md) / HookTypes

# HookTypes

## Properties

| Property | Type |
| ------ | ------ |
| `afterBootstrap` | (`db`: `Readonly`\<`objectOutputType`\<`object`, `ZodTypeAny`, `"passthrough"`\>\>, `cat`: [`CheshireCat`](../classes/CheshireCat.md)) => `objectOutputType`\<`object`, `ZodTypeAny`, `"passthrough"`\> |
| `afterInsertInMemory` | (`doc`: `Document`\<`Record`\<`string`, `any`\>\>, `interaction`: [`EmbedderInteraction`](../type-aliases/EmbedderInteraction.md), `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<`Document`\<`Record`\<`string`, `any`\>\>\> |
| `afterMemoryChain` | (`output`: [`AgentFastReply`](AgentFastReply.md), `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<[`AgentFastReply`](AgentFastReply.md)\> |
| `afterModelInteraction` | (`interaction`: [`ModelInteraction`](../type-aliases/ModelInteraction.md), `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`ModelInteraction`](../type-aliases/ModelInteraction.md) |
| `afterProceduresChain` | (`output`: [`AgentFastReply`](AgentFastReply.md), `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<[`AgentFastReply`](AgentFastReply.md)\> |
| `afterRecallMemories` | (`memory`: [`BetterReadonly`](../type-aliases/BetterReadonly.md)\<[`WorkingMemory`](WorkingMemory.md), `true`\>, `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<[`BetterReadonly`](../type-aliases/BetterReadonly.md)\<[`WorkingMemory`](WorkingMemory.md), `true`\>\> |
| `afterSendMessage` | (`msg`: [`WSMessage`](../type-aliases/WSMessage.md), `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<[`WSMessage`](../type-aliases/WSMessage.md)\> |
| `afterSplitDocs` | (`docs`: `Document`\<`Record`\<`string`, `any`\>\>[], `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<`Document`\<`Record`\<`string`, `any`\>\>[]\> |
| `afterStoreDocuments` | (`docs`: `Document`\<`Record`\<`string`, `any`\>\>[], `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<`Document`\<`Record`\<`string`, `any`\>\>[]\> |
| `agentFastReply` | (`reply`: [`Nullable`](../type-aliases/Nullable.md)\<[`AgentFastReply`](AgentFastReply.md)\>, `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<[`Nullable`](../type-aliases/Nullable.md)\<[`AgentFastReply`](AgentFastReply.md)\>\> |
| `agentPromptInstructions` | (`prompt`: `string`, `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<`string`\> |
| `agentPromptPrefix` | (`prefix`: `string`, `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<`string`\> |
| `agentPromptSuffix` | (`suffix`: `string`, `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<`string`\> |
| `allowedEmbedders` | (`embedders`: [`EmbedderConfig`](../classes/EmbedderConfig.md)\<`ZodTypeAny`\>[], `addEmbedder`: \<`Config`\>(`settings`) => [`EmbedderConfig`](../classes/EmbedderConfig.md)\<`Config`\>) => [`EmbedderConfig`](../classes/EmbedderConfig.md)\<`any`\>[] |
| `allowedLLMs` | (`llms`: [`ChatModelConfig`](../classes/ChatModelConfig.md)\<`ZodTypeAny`\>[], `addModel`: \<`Config`\>(`settings`) => [`ChatModelConfig`](../classes/ChatModelConfig.md)\<`Config`\>) => [`ChatModelConfig`](../classes/ChatModelConfig.md)\<`any`\>[] |
| `allowedTools` | (`tools`: `string`[], `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<`string`[]\> |
| `beforeAgentStarts` | (`input`: [`ContextInput`](ContextInput.md), `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<[`ContextInput`](ContextInput.md)\> |
| `beforeBootstrap` | (`db`: `Readonly`\<`objectOutputType`\<`object`, `ZodTypeAny`, `"passthrough"`\>\>) => `objectOutputType`\<`object`, `ZodTypeAny`, `"passthrough"`\> |
| `beforeInsertInMemory` | (`doc`: `Document`\<`Record`\<`string`, `any`\>\>, `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<`Document`\<`Record`\<`string`, `any`\>\>\> |
| `beforeReadMessage` | (`msg`: [`Message`](Message.md), `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<[`Message`](Message.md)\> |
| `beforeRecallMemories` | (`configs`: [`MemoryRecallConfigs`](MemoryRecallConfigs.md), `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<[`MemoryRecallConfigs`](MemoryRecallConfigs.md)\> |
| `beforeSendMessage` | (`msg`: [`MemoryMessage`](MemoryMessage.md), `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<[`MemoryMessage`](MemoryMessage.md)\> |
| `beforeSplitDocs` | (`texts`: `Document`\<`Record`\<`string`, `any`\>\>[], `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<`Document`\<`Record`\<`string`, `any`\>\>[]\> |
| `beforeStoreDocuments` | (`docs`: `Document`\<`Record`\<`string`, `any`\>\>[], `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<`Document`\<`Record`\<`string`, `any`\>\>[]\> |
| `beforeStoreEpisodicMemory` | (`doc`: `Document`\<`Record`\<`string`, `any`\>\>, `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<`Document`\<`Record`\<`string`, `any`\>\>\> |
| `fileParsers` | (`loaders`: [`FileParsers`](../type-aliases/FileParsers.md)) => [`FileParsers`](../type-aliases/FileParsers.md) |
| `instantToolTrigger` | (`input`: [`Nullable`](../type-aliases/Nullable.md)\<\`$\{string\}\{name\}$\{string\}\`\>, `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<[`Nullable`](../type-aliases/Nullable.md)\<\`$\{string\}\{name\}$\{string\}\`\>\> |
| `memoryCollections` | (`collections`: `Record`\<`string`, [`VectorMemoryCollection`](../classes/VectorMemoryCollection.md)\>) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<`Record`\<`string`, [`VectorMemoryCollection`](../classes/VectorMemoryCollection.md)\>\> |
| `recallQuery` | (`query`: `string`, `stray`: [`StrayCat`](../classes/StrayCat.md)) => [`MaybePromise`](../type-aliases/MaybePromise.md)\<`string`\> |
| `textSplitter` | (`splitter`: `TextSplitter`) => `TextSplitter` |
| `webParsers` | (`loaders`: [`WebParser`](../type-aliases/WebParser.md)[]) => [`WebParser`](../type-aliases/WebParser.md)[] |
