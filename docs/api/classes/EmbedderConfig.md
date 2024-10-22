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

> **initModel**(`params`): `Embeddings`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | `input`\<`Config`\> |

#### Returns

`Embeddings`
