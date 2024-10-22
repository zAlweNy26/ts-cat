[Overview](../index.md) / VectorMemoryCollection

# VectorMemoryCollection

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| `embedderName` | `public` | `string` |
| `embedderSize` | `public` | `number` |
| `name` | `public` | `string` |

## Methods

### addPoint()

> **addPoint**(`content`, `vector`, `metadata`?, `id`?, ...`args`?): `Promise`\<`undefined` \| `object`\>

Add a point (and its metadata) to the vector store.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `content` | `string` | Original content to push. |
| `vector` | `number`[] | The embedding vector. |
| `metadata`? | `Record`\<`string`, `any`\> | Optional metadata associated with the content. |
| `id`? | \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\` | id to associate with the point. It has to be a UUID-like string. |
| ...`args`? | `object` & `object` \| `object`[] | Optional arguments to pass. |

#### Returns

`Promise`\<`undefined` \| `object`\>

The id of the added point.

***

### addPoints()

> **addPoints**(`points`, ...`args`): `Promise`\<`object`\>

Adds an array of points to the vector memory collection.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `points` | `object`[] | An array of [PointData](../type-aliases/PointData.md) representing the points to be added. |
| ...`args` | `object` & `object` \| `object`[] | - |

#### Returns

`Promise`\<`object`\>

The result of the upsert operation.

***

### createCollection()

> **createCollection**(): `Promise`\<`void`\>

Creates a new collection with the specified configuration.

#### Returns

`Promise`\<`void`\>

***

### deletePoints()

> **deletePoints**(`ids`): `Promise`\<`object`\>

Delete points by their IDs.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ids` | `string`[] | The IDs of the points to delete. |

#### Returns

`Promise`\<`object`\>

The result of the deletion.

***

### deletePointsByMetadata()

> **deletePointsByMetadata**(`metadata`): `undefined` \| `Promise`\<`object`\>

Delete points by their metadata.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `metadata` | `Record`\<`string`, `undefined` \| `null` \| `object` \| `object` \| `object` \| `object` \| `Record`\<`string`, `unknown`\>\> | The metadata of the points to delete. |

#### Returns

`undefined` \| `Promise`\<`object`\>

The result of the deletion.

***

### getAllPoints()

> **getAllPoints**(`limit`, `filter`?): `Promise`\<`object`[]\>

Retrieves all points from the vector memory collection.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `limit` | `number` | `10000` | The maximum number of points to retrieve (default: 10000). |
| `filter`? | `Record`\<`string`, `undefined` \| `null` \| `object` \| `object` \| `object` \| `object` \| `Record`\<`string`, `unknown`\>\> | `undefined` | An optional filter to apply to the points. |

#### Returns

`Promise`\<`object`[]\>

An array of [PointData](../type-aliases/PointData.md).

***

### getPoints()

> **getPoints**(`ids`): `Promise`\<`object`[]\>

Retrieves points from the vector memory collection based on their IDs.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ids` | `string`[] | The IDs of the points to retrieve. |

#### Returns

`Promise`\<`object`[]\>

An array of [PointData](../type-aliases/PointData.md).

***

### recallMemoriesFromEmbedding()

> **recallMemoriesFromEmbedding**(`embedding`, `filter`?, `k`?, `threshold`?): `Promise`\<[`MemoryDocument`](../type-aliases/MemoryDocument.md)[]\>

Retrieves memories from the vector database based on an embedded vector.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `embedding` | `number`[] \| `object` \| `object` | `undefined` | The embedding vector to search for. |
| `filter`? | `Record`\<`string`, `undefined` \| `null` \| `object` \| `object` \| `object` \| `object` \| `Record`\<`string`, `unknown`\>\> | `undefined` | Optional filter to apply to the search. |
| `k`? | `number` | `10` | The maximum number of memories to retrieve (default: 10). |
| `threshold`? | `number` | `undefined` | The score threshold for retrieved memories. |

#### Returns

`Promise`\<[`MemoryDocument`](../type-aliases/MemoryDocument.md)[]\>

An array of [MemoryDocument](../type-aliases/MemoryDocument.md) representing the retrieved memories.

***

### saveDump()

> **saveDump**(`folder`): `Promise`\<`void`\>

Saves the collection dump to a specified folder.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `folder` | `string` | `'dormouse/'` | The folder path where the dump will be saved. Defaults to 'dormouse/'. |

#### Returns

`Promise`\<`void`\>

***

### create()

> `static` **create**(`name`, `embedderName`, `embedderSize`): `Promise`\<[`VectorMemoryCollection`](VectorMemoryCollection.md)\>

Creates a new VectorMemoryCollection with the specified name, embedder name, and embedder size.
If a collection with the same name already exists, it skips the creation step.
If the existing collection has a different size, it updates the collection by deleting and recreating it.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The name of the collection. |
| `embedderName` | `string` | The name of the embedder. |
| `embedderSize` | `number` | The size of the embedder. |

#### Returns

`Promise`\<[`VectorMemoryCollection`](VectorMemoryCollection.md)\>

The created [VectorMemoryCollection](VectorMemoryCollection.md).
