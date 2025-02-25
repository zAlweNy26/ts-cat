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

#### Get Signature

> **get** **config**(): `Config`

##### Returns

`Config`

***

### info

#### Get Signature

> **get** **info**(): `object`

##### Returns

`object`

| Name | Type |
| ------ | ------ |
| <a id="description"></a> `description` | `string` |
| <a id="id"></a> `id` | `string` |
| <a id="link"></a> `link` | `undefined` \| `string` |
| <a id="name"></a> `name` | `string` |

## Methods

### initModel()

> **initModel**(`params`): `BaseChatModel`\<`BaseChatModelCallOptions`, `AIMessageChunk`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | `input`\<`Config`\> |

#### Returns

`BaseChatModel`\<`BaseChatModelCallOptions`, `AIMessageChunk`\>
