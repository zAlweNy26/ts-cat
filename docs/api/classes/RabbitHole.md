[Overview](../index.md) / RabbitHole

# RabbitHole

## Accessors

### fileParsers

> `get` **fileParsers**(): `object`

Get the file parsers

#### Returns

`object`

***

### textSplitter

> `get` **textSplitter**(): `TextSplitter`

#### Returns

`TextSplitter`

***

### webParsers

> `get` **webParsers**(): [`WebParser`](../type-aliases/WebParser.md)[]

Get the web parsers

#### Returns

[`WebParser`](../type-aliases/WebParser.md)[]

## Methods

### ingestContent()

> **ingestContent**(`stray`, `content`, `source`, `metadata`?): `Promise`\<`void`\>

Ingests textual content into the memory.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `stray` | [`StrayCat`](StrayCat.md) | `undefined` | The StrayCat instance. |
| `content` | `string` \| `string`[] | `undefined` | The textual content to ingest. |
| `source` | `string` | `'unknown'` | The source of the content (default: 'unknown'). |
| `metadata`? | `Record`\<`string`, `any`\> | `undefined` | Additional metadata to store with the content. |

#### Returns

`Promise`\<`void`\>

***

### ingestFile()

> **ingestFile**(`stray`, `file`, `chunkSize`?, `chunkOverlap`?, `metadata`?): `Promise`\<`void`\>

Ingests a file and processes its content.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `stray` | [`StrayCat`](StrayCat.md) | The StrayCat instance. |
| `file` | `File` | The file to ingest. |
| `chunkSize`? | `number` | The size of each chunk for splitting the content. |
| `chunkOverlap`? | `number` | The overlap between chunks. |
| `metadata`? | `Record`\<`string`, `any`\> | Additional metadata to store with the content. |

#### Returns

`Promise`\<`void`\>

#### Throws

An error if the file type is not supported.

***

### ingestMemory()

> **ingestMemory**(`json`): `Promise`\<`void`\>

Upload memories to the declarative memory from a JSON file.
When doing this, please, make sure the embedder used to export the memories is the same as the one used when uploading.
The method also performs a check on the dimensionality of the embeddings (i.e. length of each vector).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `json` | [`MemoryJson`](../interfaces/MemoryJson.md) \| `File` | the json object containing the memories to be ingested. |

#### Returns

`Promise`\<`void`\>

***

### ingestPathOrURL()

> **ingestPathOrURL**(`stray`, `path`, `chunkSize`?, `chunkOverlap`?, `metadata`?): `Promise`\<`void`\>

Ingests a path or URL and processes the content.
If the input is a URL, it uses a web handler to load the content.
If the input is a file system path, it reads the file and processes the content.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `stray` | [`StrayCat`](StrayCat.md) | The StrayCat instance. |
| `path` | `string` | The path or URL to ingest. |
| `chunkSize`? | `number` | The size of each chunk for splitting the content. |
| `chunkOverlap`? | `number` | The overlap between chunks. |
| `metadata`? | `Record`\<`string`, `any`\> | Additional metadata to store with the content. |

#### Returns

`Promise`\<`void`\>

#### Throws

If the URL doesn't match any web handler or the path doesn't exist.

***

### splitDocs()

> **splitDocs**(`stray`, `docs`, `chunkSize`?, `chunkOverlap`?): `Promise`\<`Document`\<`Record`\<`string`, `any`\>\>[]\>

Splits an array of texts into smaller chunks and creates documents.
The method also executes the beforeSplitTexts and afterSplitTexts hooks.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `stray` | [`StrayCat`](StrayCat.md) | The StrayCat instance. |
| `docs` | `Document`\<`Record`\<`string`, `any`\>\>[] | The array of documents to be split. |
| `chunkSize`? | `number` | The size of each chunk for splitting the content (default: 256). |
| `chunkOverlap`? | `number` | The overlap between chunks (default: 64). |

#### Returns

`Promise`\<`Document`\<`Record`\<`string`, `any`\>\>[]\>

An array of documents.

***

### storeDocuments()

> **storeDocuments**(`stray`, `docs`, `source`, `metadata`?): `Promise`\<`void`\>

Stores the given documents in memory.
The method also executes the beforeStoreDocuments and beforeInsertInMemory hooks.
It sends a websocket notification of the progress and when the reading process is completed

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `stray` | [`StrayCat`](StrayCat.md) | The StrayCat instance. |
| `docs` | `Document`\<`Record`\<`string`, `any`\>\>[] | An array of documents to store. |
| `source` | `string` | The source of the documents. |
| `metadata`? | `Record`\<`string`, `any`\> | Additional metadata to store with the content. |

#### Returns

`Promise`\<`void`\>

***

### getInstance()

> `static` **getInstance**(): `Promise`\<[`RabbitHole`](RabbitHole.md)\>

Get the Rabbit Hole instance

#### Returns

`Promise`\<[`RabbitHole`](RabbitHole.md)\>

The Rabbit Hole class as a singleton
