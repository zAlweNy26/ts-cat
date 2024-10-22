[Overview](../index.md) / CustomOpenAIEmbeddings

# CustomOpenAIEmbeddings

## Extends

- `Embeddings`

## Constructors

### new CustomOpenAIEmbeddings()

> **new CustomOpenAIEmbeddings**(`params`): [`CustomOpenAIEmbeddings`](CustomOpenAIEmbeddings.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | `AsyncCallerParams` & `object` |

#### Returns

[`CustomOpenAIEmbeddings`](CustomOpenAIEmbeddings.md)

#### Overrides

`Embeddings.constructor`

## Methods

### embedDocuments()

> **embedDocuments**(`documents`): `Promise`\<`number`[][]\>

An abstract method that takes an array of documents as input and
returns a promise that resolves to an array of vectors for each
document.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `documents` | `string`[] | An array of documents to be embedded. |

#### Returns

`Promise`\<`number`[][]\>

A promise that resolves to an array of vectors for each document.

#### Overrides

`Embeddings.embedDocuments`

***

### embedQuery()

> **embedQuery**(`document`): `Promise`\<`number`[]\>

An abstract method that takes a single document as input and returns a
promise that resolves to a vector for the query document.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `document` | `string` | A single document to be embedded. |

#### Returns

`Promise`\<`number`[]\>

A promise that resolves to a vector for the query document.

#### Overrides

`Embeddings.embedQuery`
