[Overview](../index.md) / NewTokenHandler

# NewTokenHandler

## Extends

- `BaseCallbackHandler`

## Constructors

### new NewTokenHandler()

> **new NewTokenHandler**(`stray`, `input`?): [`NewTokenHandler`](NewTokenHandler.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `stray` | [`StrayCat`](StrayCat.md) |
| `input`? | `BaseCallbackHandlerInput` |

#### Returns

[`NewTokenHandler`](NewTokenHandler.md)

#### Overrides

`BaseCallbackHandler.constructor`

## Properties

| Property | Type | Default value | Overrides |
| ------ | ------ | ------ | ------ |
| <a id="name"></a> `name` | `string` | `'NewToken'` | `BaseCallbackHandler.name` |

## Methods

### handleLLMNewToken()

> **handleLLMNewToken**(`token`): `Promise`\<`void`\>

Called when an LLM/ChatModel in `streaming` mode produces a new token

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `token` | `string` |

#### Returns

`Promise`\<`void`\>

#### Overrides

`BaseCallbackHandler.handleLLMNewToken`
