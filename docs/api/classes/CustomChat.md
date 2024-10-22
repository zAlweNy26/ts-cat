[Overview](../index.md) / CustomChat

# CustomChat

## Extends

- `BaseChatModel`

## Constructors

### new CustomChat()

> **new CustomChat**(`params`): [`CustomChat`](CustomChat.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | `BaseLanguageModelParams` & `object` |

#### Returns

[`CustomChat`](CustomChat.md)

#### Overrides

`BaseChatModel.constructor`

## Methods

### \_generate()

> **\_generate**(`messages`, `_options`, `_runManager`?): `Promise`\<`ChatResult`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `messages` | `BaseMessage`[] |
| `_options` | `Omit`\<`BaseChatModelCallOptions`, `"callbacks"` \| `"tags"` \| `"metadata"` \| `"configurable"` \| `"recursionLimit"` \| `"runName"` \| `"runId"`\> |
| `_runManager`? | `CallbackManagerForLLMRun` |

#### Returns

`Promise`\<`ChatResult`\>

#### Overrides

`BaseChatModel._generate`

***

### \_identifyingParams()

> **\_identifyingParams**(): `Record`\<`string`, `any`\>

Get the identifying parameters of the LLM.

#### Returns

`Record`\<`string`, `any`\>

#### Overrides

`BaseChatModel._identifyingParams`

***

### \_llmType()

> **\_llmType**(): `string`

#### Returns

`string`

#### Overrides

`BaseChatModel._llmType`
