[Overview](../index.md) / VectorMemory

# VectorMemory

## Properties

| Property | Type |
| ------ | ------ |
| <a id="collections"></a> `collections` | [`VectorMemoryCollections`](../interfaces/VectorMemoryCollections.md) |

## Accessors

### db

#### Get Signature

> **get** **db**(): `QdrantClient`

Gets the vector database.

##### Returns

`QdrantClient`

## Methods

### getInstance()

> `static` **getInstance**(`params`): `Promise`\<[`VectorMemory`](VectorMemory.md)\>

Get the Vector Memory instance

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | [`VectorMemoryConfig`](../interfaces/VectorMemoryConfig.md) |

#### Returns

`Promise`\<[`VectorMemory`](VectorMemory.md)\>

The Vector Memory class as a singleton
