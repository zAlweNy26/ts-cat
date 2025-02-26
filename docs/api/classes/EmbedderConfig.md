[Overview](../index.md) / EmbedderConfig

# EmbedderConfig\<Config\>

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `Config` *extends* `z.ZodTypeAny` | `z.ZodTypeAny` |

## Constructors

### new EmbedderConfig()

> **new EmbedderConfig**\<`Config`\>(`_settings`): [`EmbedderConfig`](EmbedderConfig.md)\<`Config`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_settings` | `EmbedderSettings`\<`Config`\> |

#### Returns

[`EmbedderConfig`](EmbedderConfig.md)\<`Config`\>

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

> **initModel**(`params`): `Embeddings`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | `input`\<`Config`\> |

#### Returns

`Embeddings`
