[Overview](../index.md) / ChatModelConfig

# ChatModelConfig\<Config\>

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `Config` *extends* `z.ZodTypeAny` | `z.ZodTypeAny` |

## Constructors

### new ChatModelConfig()

> **new ChatModelConfig**\<`Config`\>(`_settings`): [`ChatModelConfig`](ChatModelConfig.md)\<`Config`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_settings` | `LLMSettings`\<`Config`\> |

#### Returns

[`ChatModelConfig`](ChatModelConfig.md)\<`Config`\>

## Accessors

### config

> `get` **config**(): `Config`

#### Returns

`Config`

***

### info

> `get` **info**(): `object`

#### Returns

`object`

| Name | Type |
| ------ | ------ |
| `description` | `string` |
| `id` | `string` |
| `link` | `undefined` \| `string` |
| `name` | `string` |

## Methods

### initModel()

> **initModel**(`params`): `BaseChatModel`\<`BaseChatModelCallOptions`, `AIMessageChunk`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | `input`\<`Config`\> |

#### Returns

`BaseChatModel`\<`BaseChatModelCallOptions`, `AIMessageChunk`\>
