[Overview](../index.md) / StrayCat

# StrayCat

The stray cat goes around tools and hook, making troubles

## Constructors

### new StrayCat()

> **new StrayCat**(`userId`, `ws`?): [`StrayCat`](StrayCat.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `userId` | `string` |
| `ws`? | `ElysiaWS`\<`unknown`, \{\}\> |

#### Returns

[`StrayCat`](StrayCat.md)

## Properties

| Property | Modifier | Type | Default value |
| ------ | ------ | ------ | ------ |
| <a id="activeform"></a> `activeForm?` | `public` | `string` | `undefined` |
| <a id="userid-1"></a> `userId` | `public` | `string` | `undefined` |
| <a id="workingmemory"></a> `workingMemory` | `public` | [`WorkingMemory`](../interfaces/WorkingMemory.md) | `undefined` |
| <a id="wsqueue"></a> `wsQueue` | `public` | [`WSMessage`](../type-aliases/WSMessage.md)[] | `[]` |

## Accessors

### agentManager

#### Get Signature

> **get** **agentManager**(): [`AgentManager`](AgentManager.md)

Get the AgentManager instance.

##### Returns

[`AgentManager`](AgentManager.md)

***

### currentEmbedder

#### Get Signature

> **get** **currentEmbedder**(): `Embeddings`

Get the current instance of the Embedder selected.

##### Returns

`Embeddings`

***

### currentLLM

#### Get Signature

> **get** **currentLLM**(): `BaseChatModel`\<`BaseChatModelCallOptions`, `AIMessageChunk`\>

Get the current instance of the LLM selected.

##### Returns

`BaseChatModel`\<`BaseChatModelCallOptions`, `AIMessageChunk`\>

***

### lastUserMessage

#### Get Signature

> **get** **lastUserMessage**(): [`Message`](../interfaces/Message.md)

Get the last user message.

##### Returns

[`Message`](../interfaces/Message.md)

***

### plugins

#### Get Signature

> **get** **plugins**(): `object`[]

Get the current installed plugins.

##### Returns

`object`[]

***

### rabbitHole

#### Get Signature

> **get** **rabbitHole**(): [`RabbitHole`](RabbitHole.md)

Get the RabbitHole instance.

##### Returns

[`RabbitHole`](RabbitHole.md)

***

### vectorMemory

#### Get Signature

> **get** **vectorMemory**(): [`VectorMemory`](VectorMemory.md)

Get the memory instance.

##### Returns

[`VectorMemory`](VectorMemory.md)

***

### whiteRabbit

#### Get Signature

> **get** **whiteRabbit**(): [`WhiteRabbit`](WhiteRabbit.md)

Get the WhiteRabbit instance.

##### Returns

[`WhiteRabbit`](WhiteRabbit.md)

## Methods

### addHistory()

> **addHistory**(`message`): `void`

Adds messages to the chat history.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `message` | [`MemoryMessage`](../type-aliases/MemoryMessage.md)[] | the messages to add |

#### Returns

`void`

***

### addInteraction()

> **addInteraction**(`interaction`): `Promise`\<`void`\>

Adds an interaction to the working memory.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `interaction` | [`ModelInteraction`](../type-aliases/ModelInteraction.md) | the interaction to add |

#### Returns

`Promise`\<`void`\>

***

### addWebSocket()

> **addWebSocket**(`value`): `void`

This property is used to establish a new WebSocket connection.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `undefined` \| `ElysiaWS`\<`unknown`, \{\}\> | The WebSocket instance. |

#### Returns

`void`

***

### classify()

> **classify**\<`S`, `T`\>(`sentence`, `labels`, `examples`?): `Promise`\<`null` \| `S`\>

**`Experimental`**

Classifies the given sentence into one of the provided labels.

#### Type Parameters

| Type Parameter |
| ------ |
| `S` *extends* `string` |
| `T` *extends* \[`S`, `...S[]`\] |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sentence` | `string` | The sentence to classify. |
| `labels` | `T` | The labels to classify the sentence into. |
| `examples`? | `{ [key in string]: S[] }` | Optional examples to help the LLM classify the sentence. |

#### Returns

`Promise`\<`null` \| `S`\>

The label of the sentence or null if it could not be classified.

***

### clearHistory()

> **clearHistory**(): `void`

Clears the chat history.

#### Returns

`void`

***

### getHistory()

> **getHistory**(`k`?): [`MemoryMessage`](../type-aliases/MemoryMessage.md)[]

If passed a number k, retrieves the last k messages in the chat history.
Otherwise, retrieves all messages in the chat history.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `k`? | `number` | the number of messages to retrieve |

#### Returns

[`MemoryMessage`](../type-aliases/MemoryMessage.md)[]

the messages present in the chat history

***

### getInteraction()

> **getInteraction**(`k`?): [`ModelInteraction`](../type-aliases/ModelInteraction.md)[]

If passed a number k, retrieves the last k interactions in the working memory.
Otherwise, retrieves all interactions in the working memory.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `k`? | `number` | the number of interactions to retrieve |

#### Returns

[`ModelInteraction`](../type-aliases/ModelInteraction.md)[]

the interactions present in the working memory

***

### getPluginInfo()

> **getPluginInfo**(`id`): `undefined` \| \{ `active`: `boolean`; `manifest`: \{ `authorName`: `string`; `authorUrl`: `string`; `description`: `string`; `name`: `string`; `pluginUrl`: `string`; `tags`: `string`[]; `thumb`: `string`; `version`: `string`; \}; `settings`: \{\}; \}

Retrieves information about a plugin.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | The ID of the plugin. |

#### Returns

`undefined` \| \{ `active`: `boolean`; `manifest`: \{ `authorName`: `string`; `authorUrl`: `string`; `description`: `string`; `name`: `string`; `pluginUrl`: `string`; `tags`: `string`[]; `thumb`: `string`; `version`: `string`; \}; `settings`: \{\}; \}

An object containing the plugin's active status, manifest, and settings.

Returns undefined if the plugin is not found.

***

### llm()

#### Call Signature

> **llm**(`prompt`, `stream`?): `Promise`\<`AIMessageChunk`\>

Executes the LLM with the given prompt and returns the response.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prompt` | `BaseLanguageModelInput` | The prompt or messages to be passed to the LLM. |
| `stream`? | `false` | Optional parameter to enable streaming mode. |

##### Returns

`Promise`\<`AIMessageChunk`\>

#### Call Signature

> **llm**(`prompt`, `stream`?): `Promise`\<`IterableReadableStream`\<`AIMessageChunk`\>\>

Executes the LLM with the given prompt and returns the response.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prompt` | `BaseLanguageModelInput` | The prompt or messages to be passed to the LLM. |
| `stream`? | `true` | Optional parameter to enable streaming mode. |

##### Returns

`Promise`\<`IterableReadableStream`\<`AIMessageChunk`\>\>

***

### queryDb()

> **queryDb**\<`T`\>(`question`, `type`, `source`): `Promise`\<`string`\>

**`Experimental`**

Executes a SQL query based on a natural language question.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* `"oracle"` \| `"postgres"` \| `"sqlite"` \| `"mysql"` \| `"mssql"` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `question` | `string` | The user question. |
| `type` | `T` | The SQL dialect to use. |
| `source` | `Omit`\<`Extract`\<`MysqlConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`PostgresConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`CockroachConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`SqliteConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`SqlServerConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`SapConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`OracleConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`CordovaConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`NativescriptConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`ReactNativeConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`SqljsConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`MongoConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`AuroraMysqlConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`AuroraPostgresConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`ExpoConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`BetterSqlite3ConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`CapacitorConnectionOptions`, \{ `type`: `T`; \}\> \| `Extract`\<`SpannerConnectionOptions`, \{ `type`: `T`; \}\>, `"type"`\> | The data source to execute the query on. |

#### Returns

`Promise`\<`string`\>

The result of the SQL query in natural language.

***

### recallRelevantMemories()

> **recallRelevantMemories**(`query`?): `Promise`\<`void`\>

Recalls relevant memories based on the given query.
If no query is provided, it uses the last user's message text as the query.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `query`? | `string` | The query string to search for relevant memories. |

#### Returns

`Promise`\<`void`\>

***

### run()

> **run**(`msg`, `save`, `returnWhy`): `Promise`\<[`WSMessage`](../type-aliases/WSMessage.md)\>

Processes the user message and returns the response.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `msg` | [`Message`](../interfaces/Message.md) | `undefined` | The message to send. |
| `save` | `boolean` | `true` | Whether to save the message or not in the chat history (default: true). |
| `returnWhy` | `boolean` | `true` | Whether to return the 'why' field in the response (default: true). |

#### Returns

`Promise`\<[`WSMessage`](../type-aliases/WSMessage.md)\>

The response message.

***

### send()

> **send**(`msg`): `Promise`\<`void`\>

Sends a message through the websocket connection.

If the websocket connection is not open, the message is queued.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `msg` | [`WSMessage`](../type-aliases/WSMessage.md) | The message to send. |

#### Returns

`Promise`\<`void`\>
