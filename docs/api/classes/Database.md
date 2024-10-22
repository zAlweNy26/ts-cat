[Overview](../index.md) / Database

# Database

## Accessors

### data

> `get` **data**(): `objectOutputType`\<`object`, `ZodTypeAny`, `"passthrough"`\>

Gets the database object.

#### Returns

`objectOutputType`\<`object`, `ZodTypeAny`, `"passthrough"`\>

A deep clone of the database data.

| Name | Type |
| ------ | ------ |
| `activeForms` | `ZodDefault`\<`ZodSet`\<`ZodString`\>\> |
| `activePlugins` | `ZodDefault`\<`ZodSet`\<`ZodString`\>\> |
| `activeTools` | `ZodDefault`\<`ZodSet`\<`ZodString`\>\> |
| `cache` | `ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\> |
| `chunkOverlap` | `ZodDefault`\<`ZodNumber`\> |
| `chunkSize` | `ZodDefault`\<`ZodNumber`\> |
| `embedders` | `ZodDefault`\<`ZodArray`\<`ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\>, `"many"`\>\> |
| `instantTool` | `ZodDefault`\<`ZodBoolean`\> |
| `llms` | `ZodDefault`\<`ZodArray`\<`ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\>, `"many"`\>\> |
| `rateLimiter` | `ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\> |
| `selectedEmbedder` | `ZodDefault`\<`ZodString`\> |
| `selectedLLM` | `ZodDefault`\<`ZodString`\> |

***

### keys

> `get` **keys**(): `ZodObject`\<`object`, `"passthrough"`, `ZodTypeAny`, `objectOutputType`\<`object`, `ZodTypeAny`, `"passthrough"`\>, `objectInputType`\<`object`, `ZodTypeAny`, `"passthrough"`\>\>

Gets the schema of the default keys of the database.

#### Returns

`ZodObject`\<`object`, `"passthrough"`, `ZodTypeAny`, `objectOutputType`\<`object`, `ZodTypeAny`, `"passthrough"`\>, `objectInputType`\<`object`, `ZodTypeAny`, `"passthrough"`\>\>

| Name | Type |
| ------ | ------ |
| `activeForms` | `ZodDefault`\<`ZodSet`\<`ZodString`\>\> |
| `activePlugins` | `ZodDefault`\<`ZodSet`\<`ZodString`\>\> |
| `activeTools` | `ZodDefault`\<`ZodSet`\<`ZodString`\>\> |
| `cache` | `ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\> |
| `chunkOverlap` | `ZodDefault`\<`ZodNumber`\> |
| `chunkSize` | `ZodDefault`\<`ZodNumber`\> |
| `embedders` | `ZodDefault`\<`ZodArray`\<`ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\>, `"many"`\>\> |
| `instantTool` | `ZodDefault`\<`ZodBoolean`\> |
| `llms` | `ZodDefault`\<`ZodArray`\<`ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\>, `"many"`\>\> |
| `rateLimiter` | `ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\> |
| `selectedEmbedder` | `ZodDefault`\<`ZodString`\> |
| `selectedLLM` | `ZodDefault`\<`ZodString`\> |

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

> **parse**(`data`): `SafeParseReturnType`\<`objectInputType`\<`object`, `ZodTypeAny`, `"passthrough"`\>, `objectOutputType`\<`object`, `ZodTypeAny`, `"passthrough"`\>\>

Parses the given data.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `objectOutputType`\<`object`, `ZodTypeAny`, `"passthrough"`\> | The data to be parsed. |

#### Returns

`SafeParseReturnType`\<`objectInputType`\<`object`, `ZodTypeAny`, `"passthrough"`\>, `objectOutputType`\<`object`, `ZodTypeAny`, `"passthrough"`\>\>

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
