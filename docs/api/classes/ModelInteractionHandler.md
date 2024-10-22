[Overview](../index.md) / ModelInteractionHandler

# ModelInteractionHandler

## Extends

- `BaseCallbackHandler`

## Constructors

### new ModelInteractionHandler()

> **new ModelInteractionHandler**(`stray`, `source`, `input`?): [`ModelInteractionHandler`](ModelInteractionHandler.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `stray` | [`StrayCat`](StrayCat.md) |
| `source` | `string` |
| `input`? | `BaseCallbackHandlerInput` |

#### Returns

[`ModelInteractionHandler`](ModelInteractionHandler.md)

#### Overrides

`BaseCallbackHandler.constructor`

## Properties

| Property | Type | Default value | Overrides |
| ------ | ------ | ------ | ------ |
| `name` | `string` | `'ModelInteraction'` | `BaseCallbackHandler.name` |

## Methods

### handleLLMEnd()

> **handleLLMEnd**(`output`): `Promise`\<`void`\>

Called at the end of an LLM/ChatModel run, with the output and the run ID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `output` | `LLMResult` |

#### Returns

`Promise`\<`void`\>

#### Overrides

`BaseCallbackHandler.handleLLMEnd`

***

### handleLLMStart()

> **handleLLMStart**(`_llm`, `prompts`): `Promise`\<`void`\>

Called at the start of an LLM or Chat Model run, with the prompt(s)
and the run ID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_llm` | `Serialized` |
| `prompts` | `string`[] |

#### Returns

`Promise`\<`void`\>

#### Overrides

`BaseCallbackHandler.handleLLMStart`
