# API Reference

## Namespaces

| Namespace | Description |
| ------ | ------ |
| [NodeJS](namespaces/NodeJS/index.md) | - |

## Enumerations

| Enumeration | Description |
| ------ | ------ |
| [FormState](enumerations/FormState.md) | - |

## Classes

| Class | Description |
| ------ | ------ |
| [AgentManager](classes/AgentManager.md) | Manager of Langchain Agent. This class manages the Agent that uses the LLM. It takes care of formatting the prompt and filtering the tools before feeding them to the Agent. It also instantiates the Langchain Agent. |
| [ChatModelConfig](classes/ChatModelConfig.md) | - |
| [CheshireCat](classes/CheshireCat.md) | - |
| [CustomChat](classes/CustomChat.md) | - |
| [CustomChatOllama](classes/CustomChatOllama.md) | - |
| [CustomChatOpenAI](classes/CustomChatOpenAI.md) | - |
| [CustomOpenAIEmbeddings](classes/CustomOpenAIEmbeddings.md) | - |
| [Database](classes/Database.md) | - |
| [EmbedderConfig](classes/EmbedderConfig.md) | - |
| [FakeChat](classes/FakeChat.md) | - |
| [FastEmbedEmbeddings](classes/FastEmbedEmbeddings.md) | - |
| [Form](classes/Form.md) | - |
| [HttpError](classes/HttpError.md) | - |
| [MadHatter](classes/MadHatter.md) | - |
| [ModelInteractionHandler](classes/ModelInteractionHandler.md) | - |
| [NewTokenHandler](classes/NewTokenHandler.md) | - |
| [Plugin](classes/Plugin.md) | - |
| [ProceduresOutputParser](classes/ProceduresOutputParser.md) | - |
| [RabbitHole](classes/RabbitHole.md) | - |
| [RateLimitHandler](classes/RateLimitHandler.md) | - |
| [StrayCat](classes/StrayCat.md) | The stray cat goes around tools and hook, making troubles |
| [Tool](classes/Tool.md) | - |
| [ToolPromptTemplate](classes/ToolPromptTemplate.md) | - |
| [VectorMemory](classes/VectorMemory.md) | - |
| [VectorMemoryCollection](classes/VectorMemoryCollection.md) | - |
| [WhiteRabbit](classes/WhiteRabbit.md) | - |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [AgentFastReply](interfaces/AgentFastReply.md) | The agent reply configuration. |
| [ContextInput](interfaces/ContextInput.md) | The context input for the agent. |
| [HookTypes](interfaces/HookTypes.md) | - |
| [Interaction](interfaces/Interaction.md) | - |
| [IntermediateStep](interfaces/IntermediateStep.md) | The intermediate step of the agent. |
| [MemoryJson](interfaces/MemoryJson.md) | The accepted JSON format for an imported memory. |
| [MemoryMessage](interfaces/MemoryMessage.md) | The content of a memory message. |
| [MemoryRecallConfig](interfaces/MemoryRecallConfig.md) | The configuration for memory recall. |
| [MemoryRecallConfigs](interfaces/MemoryRecallConfigs.md) | The configurations for each memory recall. |
| [Message](interfaces/Message.md) | A message object sent by the user. |
| [VectorMemoryCollections](interfaces/VectorMemoryCollections.md) | The configurations for each vector memory. |
| [VectorMemoryConfig](interfaces/VectorMemoryConfig.md) | The configuration of a vector memory. |
| [WorkingMemory](interfaces/WorkingMemory.md) | The working memory of the cat. |

## Type Aliases

| Type alias | Description |
| ------ | ------ |
| [BetterReadonly](type-aliases/BetterReadonly.md) | - |
| [DatabaseConfig](type-aliases/DatabaseConfig.md) | - |
| [EmbeddedVector](type-aliases/EmbeddedVector.md) | - |
| [EmbedderInteraction](type-aliases/EmbedderInteraction.md) | - |
| [FileParsers](type-aliases/FileParsers.md) | - |
| [Filter](type-aliases/Filter.md) | - |
| [FilterCondition](type-aliases/FilterCondition.md) | - |
| [FilterMatch](type-aliases/FilterMatch.md) | - |
| [Hook](type-aliases/Hook.md) | - |
| [HookNames](type-aliases/HookNames.md) | - |
| [Hooks](type-aliases/Hooks.md) | - |
| [InstantToolTrigger](type-aliases/InstantToolTrigger.md) | - |
| [Json](type-aliases/Json.md) | - |
| [LLMInteraction](type-aliases/LLMInteraction.md) | - |
| [MaybePromise](type-aliases/MaybePromise.md) | - |
| [MemoryDocument](type-aliases/MemoryDocument.md) | A memory document. |
| [ModelInteraction](type-aliases/ModelInteraction.md) | - |
| [Nullable](type-aliases/Nullable.md) | - |
| [PointData](type-aliases/PointData.md) | - |
| [Primitive](type-aliases/Primitive.md) | - |
| [TODO](type-aliases/TODO.md) | - |
| [WebParser](type-aliases/WebParser.md) | - |
| [WS](type-aliases/WS.md) | - |
| [WSMessage](type-aliases/WSMessage.md) | A message object sent by the websocket. |

## Variables

| Variable | Description |
| ------ | ------ |
| [app](variables/app.md) | - |
| [CatForm](variables/CatForm.md) | - |
| [CatHook](variables/CatHook.md) | - |
| [catPaths](variables/catPaths.md) | It contains various paths and URLs used in the application. |
| [CatPlugin](variables/CatPlugin.md) | - |
| [CatTool](variables/CatTool.md) | - |
| [chatMessage](variables/chatMessage.md) | - |
| [cheshireCat](variables/cheshireCat.md) | - |
| [db](variables/db.md) | - |
| [embedderRoutes](variables/embedderRoutes.md) | - |
| [generalRoutes](variables/generalRoutes.md) | - |
| [httpError](variables/httpError.md) | - |
| [httpLogger](variables/httpLogger.md) | - |
| [llmRoutes](variables/llmRoutes.md) | - |
| [log](variables/log.md) | The logger module provides various logging functions. |
| [LogLevel](variables/LogLevel.md) | - |
| [madHatter](variables/madHatter.md) | - |
| [memoryMessage](variables/memoryMessage.md) | - |
| [memoryRecall](variables/memoryRecall.md) | - |
| [memoryRoutes](variables/memoryRoutes.md) | - |
| [messageInput](variables/messageInput.md) | - |
| [modelInfo](variables/modelInfo.md) | - |
| [parsedEnv](variables/parsedEnv.md) | The parsed environment variables. |
| [pluginInfo](variables/pluginInfo.md) | - |
| [pluginManifest](variables/pluginManifest.md) | - |
| [pluginSettings](variables/pluginSettings.md) | - |
| [pluginsRoutes](variables/pluginsRoutes.md) | - |
| [rabbitHole](variables/rabbitHole.md) | Manages content ingestion. I'm late... I'm late! |
| [rabbitHoleRoutes](variables/rabbitHoleRoutes.md) | - |
| [serverContext](variables/serverContext.md) | - |
| [settingsRoutes](variables/settingsRoutes.md) | - |
| [swaggerTags](variables/swaggerTags.md) | - |
| [vectorDb](variables/vectorDb.md) | - |
| [whiteRabbit](variables/whiteRabbit.md) | I'm late, I'm late, for a very important date! |
| [zodBoolean](variables/zodBoolean.md) | A Zod schema for fixing coercion of boolean value. |
| [zodJson](variables/zodJson.md) | A Zod schema for JSON objects. |
| [zodPrimitive](variables/zodPrimitive.md) | A Zod schema for primitive values. |

## Functions

| Function | Description |
| ------ | ------ |
| [addChatModel](functions/addChatModel.md) | - |
| [addEmbeddings](functions/addEmbeddings.md) | - |
| [catchError](functions/catchError.md) | Catches errors from a promise. |
| [compareStrings](functions/compareStrings.md) | Compares two strings using an evaluator. |
| [deepDefaults](functions/deepDefaults.md) | Merges the properties of the source objects into the target object, recursively applying defaults. |
| [embedderCache](functions/embedderCache.md) | - |
| [existsDir](functions/existsDir.md) | Checks if a directory exists. |
| [getAllowedEmbedders](functions/getAllowedEmbedders.md) | - |
| [getAllowedLLMs](functions/getAllowedLLMs.md) | - |
| [getEmbedder](functions/getEmbedder.md) | - |
| [getEmbedderSettings](functions/getEmbedderSettings.md) | - |
| [getLLM](functions/getLLM.md) | - |
| [getLLMSettings](functions/getLLMSettings.md) | - |
| [getVectorMemory](functions/getVectorMemory.md) | - |
| [getZodDefaults](functions/getZodDefaults.md) | Retrieves the default values for a given Zod schema. |
| [isForm](functions/isForm.md) | - |
| [isHook](functions/isHook.md) | - |
| [isTool](functions/isTool.md) | - |
| [llmCache](functions/llmCache.md) | - |
| [logWelcome](functions/logWelcome.md) | Logs a welcome message and prints important URLs. |
| [normalizeMessageChunks](functions/normalizeMessageChunks.md) | Normalizes the content of a message chunk. |
| [parseJson](functions/parseJson.md) | Parses a JSON string using the specified Zod schema. It also cleans a few common issues with generated JSON strings. |
