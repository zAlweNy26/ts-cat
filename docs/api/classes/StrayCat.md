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
| `ws`? | [`WS`](../type-aliases/WS.md) |

#### Returns

[`StrayCat`](StrayCat.md)

## Properties

| Property | Modifier | Type | Default value |
| ------ | ------ | ------ | ------ |
| `activeForm?` | `public` | `string` | `undefined` |
| `userId` | `public` | `string` | `undefined` |
| `workingMemory` | `public` | [`WorkingMemory`](../interfaces/WorkingMemory.md) | `undefined` |
| `wsQueue` | `public` | [`WSMessage`](../type-aliases/WSMessage.md)[] | `[]` |

## Accessors

### agentManager

> `get` **agentManager**(): [`AgentManager`](AgentManager.md)

#### Returns

[`AgentManager`](AgentManager.md)

***

### currentEmbedder

> `get` **currentEmbedder**(): `Embeddings`

#### Returns

`Embeddings`

***

### currentLLM

> `get` **currentLLM**(): `BaseChatModel`\<`BaseChatModelCallOptions`, `AIMessageChunk`\>

#### Returns

`BaseChatModel`\<`BaseChatModelCallOptions`, `AIMessageChunk`\>

***

### lastUserMessage

> `get` **lastUserMessage**(): [`Message`](../interfaces/Message.md)

#### Returns

[`Message`](../interfaces/Message.md)

***

### plugins

> `get` **plugins**(): `object`[]

#### Returns

`object`[]

***

### rabbitHole

> `get` **rabbitHole**(): [`RabbitHole`](RabbitHole.md)

#### Returns

[`RabbitHole`](RabbitHole.md)

***

### vectorMemory

> `get` **vectorMemory**(): [`VectorMemory`](VectorMemory.md)

#### Returns

[`VectorMemory`](VectorMemory.md)

***

### whiteRabbit

> `get` **whiteRabbit**(): [`WhiteRabbit`](WhiteRabbit.md)

#### Returns

[`WhiteRabbit`](WhiteRabbit.md)

## Methods

### addHistory()

> **addHistory**(`message`): `void`

Adds messages to the chat history.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `message` | [`MemoryMessage`](../interfaces/MemoryMessage.md)[] | the messages to add |

#### Returns

`void`

***

### addInteraction()

> **addInteraction**(`interaction`): `void`

Adds an interaction to the working memory.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `interaction` | [`ModelInteraction`](../type-aliases/ModelInteraction.md) | the interaction to add |

#### Returns

`void`

***

### addWebSocket()

> **addWebSocket**(`value`): `void`

This property is used to establish a new WebSocket connection.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `undefined` \| [`WS`](../type-aliases/WS.md) | The WebSocket instance. |

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
| `T` *extends* [`S`, `...S[]`] |

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

> **getHistory**(`k`?): [`MemoryMessage`](../interfaces/MemoryMessage.md)[]

If passed a number k, retrieves the last k messages in the chat history.
Otherwise, retrieves all messages in the chat history.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `k`? | `number` | the number of messages to retrieve |

#### Returns

[`MemoryMessage`](../interfaces/MemoryMessage.md)[]

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

> **getPluginInfo**(): `Promise`\<`undefined` \| `object`\>

Retrieves information about a plugin based on where it's executed.

#### Returns

`Promise`\<`undefined` \| `object`\>

An object containing the plugin's active status, manifest, and settings.

Returns undefined if the plugin is not found.

***

### llm()

#### llm(prompt, stream)

> **llm**(`prompt`, `stream`?): `Promise`\<`AIMessageChunk`\>

Executes the LLM with the given prompt and returns the response.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prompt` | `BaseLanguageModelInput` | The prompt or messages to be passed to the LLM. |
| `stream`? | `false` | Optional parameter to enable streaming mode. |

##### Returns

`Promise`\<`AIMessageChunk`\>

#### llm(prompt, stream)

> **llm**(`prompt`, `stream`?): `Promise`\<`IterableReadableStream`\<`AIMessageChunk`\>\>

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `prompt` | `BaseLanguageModelInput` |
| `stream`? | `true` |

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
| `source` | `Omit`\<`Extract`\<`MysqlConnectionOptions`, `object`\> \| `Extract`\<`PostgresConnectionOptions`, `object`\> \| `Extract`\<`CockroachConnectionOptions`, `object`\> \| `Extract`\<`SqliteConnectionOptions`, `object`\> \| `Extract`\<`SqlServerConnectionOptions`, `object`\> \| `Extract`\<`SapConnectionOptions`, `object`\> \| `Extract`\<`OracleConnectionOptions`, `object`\> \| `Extract`\<`CordovaConnectionOptions`, `object`\> \| `Extract`\<`NativescriptConnectionOptions`, `object`\> \| `Extract`\<`ReactNativeConnectionOptions`, `object`\> \| `Extract`\<`SqljsConnectionOptions`, `object`\> \| `Extract`\<`MongoConnectionOptions`, `object`\> \| `Extract`\<`AuroraMysqlConnectionOptions`, `object`\> \| `Extract`\<`AuroraPostgresConnectionOptions`, `object`\> \| `Extract`\<`ExpoConnectionOptions`, `object`\> \| `Extract`\<`BetterSqlite3ConnectionOptions`, `object`\> \| `Extract`\<`CapacitorConnectionOptions`, `object`\> \| `Extract`\<`SpannerConnectionOptions`, `object`\>, `"type"`\> | The data source to execute the query on. |

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

> **send**(`msg`): `void`

Sends a message through the websocket connection.

If the websocket connection is not open, the message is queued.

If the message is of type 'chat', it is also stored in the chat history.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `msg` | [`WSMessage`](../type-aliases/WSMessage.md) | The message to send. |

#### Returns

`void`
