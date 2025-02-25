[Overview](../index.md) / CheshireCat

# CheshireCat

The Cheshire Cat is here to guide you through the looking glass.

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

### embedderSize

#### Get Signature

> **get** **embedderSize**(): `number`

Get the embedder size.

##### Returns

`number`

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

### addStray()

> **addStray**(`userId`, `ws`?): [`StrayCat`](StrayCat.md)

Add a StrayCat with the given userId to the collection of strays.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `userId` | `string` | The unique identifier of the stray cat. |
| `ws`? | `ElysiaWS`\<`unknown`, \{\}\> | - |

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

#### Throws

An error if not able to retrieve the size of the embeddings.

***

### loadNaturalLanguage()

> **loadNaturalLanguage**(): `Promise`\<`void`\>

Load the Large Language Model (LLM) and the Embedder from the database.
If the selected LLM or Embedder is not found, it falls back to the default one.

#### Returns

`Promise`\<`void`\>

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
