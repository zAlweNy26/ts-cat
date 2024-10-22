[Overview](../index.md) / CheshireCat

# CheshireCat

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

### embedderSize

> `get` **embedderSize**(): `number`

#### Returns

`number`

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

### addStray()

> **addStray**(`userId`, `ws`?): [`StrayCat`](StrayCat.md)

Add a StrayCat with the given userId to the collection of strays.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `userId` | `string` | The unique identifier of the stray cat. |
| `ws`? | [`WS`](../type-aliases/WS.md) | - |

#### Returns

[`StrayCat`](StrayCat.md)

The StrayCat instance associated with the given userId.

***

### embedProcedures()

> **embedProcedures**(): `Promise`\<`void`\>

Embed tools and forms into the memory.

#### Returns

`Promise`\<`void`\>

***

### getStray()

> **getStray**(`userId`): `undefined` \| [`StrayCat`](StrayCat.md)

Get the StrayCat instance associated with the given userId.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `userId` | `string` | The unique identifier of the stray cat. |

#### Returns

`undefined` \| [`StrayCat`](StrayCat.md)

The StrayCat instance associated with the given userId.

***

### loadMemory()

> **loadMemory**(): `Promise`\<`void`\>

Loads the long term memory from the database.

#### Returns

`Promise`\<`void`\>

***

### loadNaturalLanguage()

> **loadNaturalLanguage**(): `void`

Load the Large Language Model (LLM) and the Embedder from the database.
If the selected LLM or Embedder is not found, it falls back to the default one.

#### Returns

`void`

***

### removeStray()

> **removeStray**(`userId`): `boolean`

Removes a stray instance for the specified user from the collection.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `userId` | `string` | The ID of the user to remove. |

#### Returns

`boolean`

True if the user was successfully removed, false otherwise.

***

### getInstance()

> `static` **getInstance**(): `Promise`\<[`CheshireCat`](CheshireCat.md)\>

Get the Cheshire Cat instance

#### Returns

`Promise`\<[`CheshireCat`](CheshireCat.md)\>

The Cheshire Cat class as a singleton
