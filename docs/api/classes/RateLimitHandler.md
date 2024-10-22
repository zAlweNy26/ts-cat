[Overview](../index.md) / RateLimitHandler

# RateLimitHandler

## Extends

- `BaseCallbackHandler`

## Implements

- `RateLimitHandlerParams`

## Constructors

### new RateLimitHandler()

> **new RateLimitHandler**(`input`?): [`RateLimitHandler`](RateLimitHandler.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input`? | `BaseCallbackHandlerInput` |

#### Returns

[`RateLimitHandler`](RateLimitHandler.md)

#### Overrides

`BaseCallbackHandler.constructor`

## Properties

| Property | Type | Default value | Overrides |
| ------ | ------ | ------ | ------ |
| `availableTokens` | `number` | `0` | - |
| `checkInterval` | `number` | `undefined` | - |
| `enabled` | `boolean` | `false` | - |
| `lastRequest` | `number` | `0` | - |
| `maxBucketSize` | `number` | `undefined` | - |
| `name` | `string` | `'RateLimit'` | `BaseCallbackHandler.name` |
| `tokensPerSecond` | `number` | `undefined` | - |

## Methods

### acquire()

> **acquire**(`blocking`): `Promise`\<`boolean`\>

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `blocking` | `boolean` | `true` |

#### Returns

`Promise`\<`boolean`\>

***

### consume()

> **consume**(): `boolean`

#### Returns

`boolean`

***

### handleChainStart()

> **handleChainStart**(): `Promise`\<`void`\>

Called at the start of a Chain run, with the chain name and inputs
and the run ID.

#### Returns

`Promise`\<`void`\>

#### Overrides

`BaseCallbackHandler.handleChainStart`

***

### handleLLMStart()

> **handleLLMStart**(): `Promise`\<`void`\>

Called at the start of an LLM or Chat Model run, with the prompt(s)
and the run ID.

#### Returns

`Promise`\<`void`\>

#### Overrides

`BaseCallbackHandler.handleLLMStart`
