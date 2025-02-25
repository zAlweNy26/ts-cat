[Overview](../index.md) / Database

# Database

## Accessors

### data

#### Get Signature

> **get** **data**(): `objectOutputType`\<\{ `activeForms`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activePlugins`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activeTools`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `chunkOverlap`: `ZodDefault`\<`ZodNumber`\>; `chunkSize`: `ZodDefault`\<`ZodNumber`\>; `embedders`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `instantTool`: `ZodDefault`\<`ZodBoolean`\>; `llms`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `rateLimiter`: `ZodObject`\<\{ `checkInterval`: `ZodDefault`\<`ZodNumber`\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `maxBucketSize`: `ZodDefault`\<`ZodNumber`\>; `tokensPerSecond`: `ZodDefault`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}\>; `selectedEmbedder`: `ZodDefault`\<`ZodString`\>; `selectedLLM`: `ZodDefault`\<`ZodString`\>; \}, `ZodTypeAny`, `"passthrough"`\>

Gets the database object.

##### Returns

`objectOutputType`\<\{ `activeForms`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activePlugins`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activeTools`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `chunkOverlap`: `ZodDefault`\<`ZodNumber`\>; `chunkSize`: `ZodDefault`\<`ZodNumber`\>; `embedders`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `instantTool`: `ZodDefault`\<`ZodBoolean`\>; `llms`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `rateLimiter`: `ZodObject`\<\{ `checkInterval`: `ZodDefault`\<`ZodNumber`\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `maxBucketSize`: `ZodDefault`\<`ZodNumber`\>; `tokensPerSecond`: `ZodDefault`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}\>; `selectedEmbedder`: `ZodDefault`\<`ZodString`\>; `selectedLLM`: `ZodDefault`\<`ZodString`\>; \}, `ZodTypeAny`, `"passthrough"`\>

A deep clone of the database data.

***

### keys

#### Get Signature

> **get** **keys**(): `ZodObject`\<\{ `activeForms`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activePlugins`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activeTools`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `chunkOverlap`: `ZodDefault`\<`ZodNumber`\>; `chunkSize`: `ZodDefault`\<`ZodNumber`\>; `embedders`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `instantTool`: `ZodDefault`\<`ZodBoolean`\>; `llms`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `rateLimiter`: `ZodObject`\<\{ `checkInterval`: `ZodDefault`\<`ZodNumber`\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `maxBucketSize`: `ZodDefault`\<`ZodNumber`\>; `tokensPerSecond`: `ZodDefault`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}\>; `selectedEmbedder`: `ZodDefault`\<`ZodString`\>; `selectedLLM`: `ZodDefault`\<`ZodString`\>; \}, `"passthrough"`, `ZodTypeAny`, `objectOutputType`\<\{ `activeForms`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activePlugins`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activeTools`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `chunkOverlap`: `ZodDefault`\<`ZodNumber`\>; `chunkSize`: `ZodDefault`\<`ZodNumber`\>; `embedders`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `instantTool`: `ZodDefault`\<`ZodBoolean`\>; `llms`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `rateLimiter`: `ZodObject`\<\{ `checkInterval`: `ZodDefault`\<`ZodNumber`\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `maxBucketSize`: `ZodDefault`\<`ZodNumber`\>; `tokensPerSecond`: `ZodDefault`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}\>; `selectedEmbedder`: `ZodDefault`\<`ZodString`\>; `selectedLLM`: `ZodDefault`\<`ZodString`\>; \}, `ZodTypeAny`, `"passthrough"`\>, `objectInputType`\<\{ `activeForms`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activePlugins`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activeTools`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `chunkOverlap`: `ZodDefault`\<`ZodNumber`\>; `chunkSize`: `ZodDefault`\<`ZodNumber`\>; `embedders`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `instantTool`: `ZodDefault`\<`ZodBoolean`\>; `llms`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `rateLimiter`: `ZodObject`\<\{ `checkInterval`: `ZodDefault`\<`ZodNumber`\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `maxBucketSize`: `ZodDefault`\<`ZodNumber`\>; `tokensPerSecond`: `ZodDefault`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}\>; `selectedEmbedder`: `ZodDefault`\<`ZodString`\>; `selectedLLM`: `ZodDefault`\<`ZodString`\>; \}, `ZodTypeAny`, `"passthrough"`\>\>

Gets the schema of the default keys of the database.

##### Returns

`ZodObject`\<\{ `activeForms`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activePlugins`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activeTools`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `chunkOverlap`: `ZodDefault`\<`ZodNumber`\>; `chunkSize`: `ZodDefault`\<`ZodNumber`\>; `embedders`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `instantTool`: `ZodDefault`\<`ZodBoolean`\>; `llms`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `rateLimiter`: `ZodObject`\<\{ `checkInterval`: `ZodDefault`\<`ZodNumber`\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `maxBucketSize`: `ZodDefault`\<`ZodNumber`\>; `tokensPerSecond`: `ZodDefault`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}\>; `selectedEmbedder`: `ZodDefault`\<`ZodString`\>; `selectedLLM`: `ZodDefault`\<`ZodString`\>; \}, `"passthrough"`, `ZodTypeAny`, `objectOutputType`\<\{ `activeForms`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activePlugins`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activeTools`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `chunkOverlap`: `ZodDefault`\<`ZodNumber`\>; `chunkSize`: `ZodDefault`\<`ZodNumber`\>; `embedders`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `instantTool`: `ZodDefault`\<`ZodBoolean`\>; `llms`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `rateLimiter`: `ZodObject`\<\{ `checkInterval`: `ZodDefault`\<`ZodNumber`\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `maxBucketSize`: `ZodDefault`\<`ZodNumber`\>; `tokensPerSecond`: `ZodDefault`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}\>; `selectedEmbedder`: `ZodDefault`\<`ZodString`\>; `selectedLLM`: `ZodDefault`\<`ZodString`\>; \}, `ZodTypeAny`, `"passthrough"`\>, `objectInputType`\<\{ `activeForms`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activePlugins`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activeTools`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `chunkOverlap`: `ZodDefault`\<`ZodNumber`\>; `chunkSize`: `ZodDefault`\<`ZodNumber`\>; `embedders`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `instantTool`: `ZodDefault`\<`ZodBoolean`\>; `llms`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `rateLimiter`: `ZodObject`\<\{ `checkInterval`: `ZodDefault`\<`ZodNumber`\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `maxBucketSize`: `ZodDefault`\<`ZodNumber`\>; `tokensPerSecond`: `ZodDefault`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}\>; `selectedEmbedder`: `ZodDefault`\<`ZodString`\>; `selectedLLM`: `ZodDefault`\<`ZodString`\>; \}, `ZodTypeAny`, `"passthrough"`\>\>

## Methods

### delete()

> **delete**(`key`): `void`

Deletes a key-value pair from the database.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The key of the pair to delete. |

#### Returns

`void`

***

### parse()

> **parse**(`data`): `SafeParseReturnType`\<`objectInputType`\<\{ `activeForms`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activePlugins`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activeTools`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `chunkOverlap`: `ZodDefault`\<`ZodNumber`\>; `chunkSize`: `ZodDefault`\<`ZodNumber`\>; `embedders`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `instantTool`: `ZodDefault`\<`ZodBoolean`\>; `llms`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `rateLimiter`: `ZodObject`\<\{ `checkInterval`: `ZodDefault`\<`ZodNumber`\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `maxBucketSize`: `ZodDefault`\<`ZodNumber`\>; `tokensPerSecond`: `ZodDefault`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}\>; `selectedEmbedder`: `ZodDefault`\<`ZodString`\>; `selectedLLM`: `ZodDefault`\<`ZodString`\>; \}, `ZodTypeAny`, `"passthrough"`\>, `objectOutputType`\<\{ `activeForms`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activePlugins`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activeTools`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `chunkOverlap`: `ZodDefault`\<`ZodNumber`\>; `chunkSize`: `ZodDefault`\<`ZodNumber`\>; `embedders`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `instantTool`: `ZodDefault`\<`ZodBoolean`\>; `llms`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `rateLimiter`: `ZodObject`\<\{ `checkInterval`: `ZodDefault`\<`ZodNumber`\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `maxBucketSize`: `ZodDefault`\<`ZodNumber`\>; `tokensPerSecond`: `ZodDefault`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}\>; `selectedEmbedder`: `ZodDefault`\<`ZodString`\>; `selectedLLM`: `ZodDefault`\<`ZodString`\>; \}, `ZodTypeAny`, `"passthrough"`\>\>

Parses the given data.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `objectOutputType` | The data to be parsed. |

#### Returns

`SafeParseReturnType`\<`objectInputType`\<\{ `activeForms`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activePlugins`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activeTools`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `chunkOverlap`: `ZodDefault`\<`ZodNumber`\>; `chunkSize`: `ZodDefault`\<`ZodNumber`\>; `embedders`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `instantTool`: `ZodDefault`\<`ZodBoolean`\>; `llms`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `rateLimiter`: `ZodObject`\<\{ `checkInterval`: `ZodDefault`\<`ZodNumber`\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `maxBucketSize`: `ZodDefault`\<`ZodNumber`\>; `tokensPerSecond`: `ZodDefault`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}\>; `selectedEmbedder`: `ZodDefault`\<`ZodString`\>; `selectedLLM`: `ZodDefault`\<`ZodString`\>; \}, `ZodTypeAny`, `"passthrough"`\>, `objectOutputType`\<\{ `activeForms`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activePlugins`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `activeTools`: `ZodDefault`\<`ZodSet`\<`ZodString`\>\>; `chunkOverlap`: `ZodDefault`\<`ZodNumber`\>; `chunkSize`: `ZodDefault`\<`ZodNumber`\>; `embedders`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `instantTool`: `ZodDefault`\<`ZodBoolean`\>; `llms`: `ZodDefault`\<`ZodArray`\<`ZodObject`\<\{ `name`: `ZodString`; `value`: `ZodRecord`\<`ZodString`, `ZodAny`\>; \}, `"strip"`, `ZodTypeAny`, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}, \{ `name`: `string`; `value`: `Record`\<`string`, `any`\>; \}\>, `"many"`\>\>; `rateLimiter`: `ZodObject`\<\{ `checkInterval`: `ZodDefault`\<`ZodNumber`\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `maxBucketSize`: `ZodDefault`\<`ZodNumber`\>; `tokensPerSecond`: `ZodDefault`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}, \{ `checkInterval`: `number`; `enabled`: `boolean`; `maxBucketSize`: `number`; `tokensPerSecond`: `number`; \}\>; `selectedEmbedder`: `ZodDefault`\<`ZodString`\>; `selectedLLM`: `ZodDefault`\<`ZodString`\>; \}, `ZodTypeAny`, `"passthrough"`\>\>

The safely parsed data.

***

### update()

> **update**(`fn`): `void`

Updates the database configuration and reads the updated configuration.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (`db`) => `void` | A function that takes the current database configuration as a parameter and updates it. |

#### Returns

`void`

***

### init()

> `static` **init**(`path`): [`Database`](Database.md)

Initializes the database with the specified path.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | The path to the database. |

#### Returns

[`Database`](Database.md)

The initialized database instance.
