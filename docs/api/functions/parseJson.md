[Overview](../index.md) / parseJson

# parseJson()

> **parseJson**\<`T`\>(`text`, `schema`, `addDefaults`): `Promise`\<`TypeOf`\<`T`\>\>

Parses a JSON string using the specified Zod schema.
It also cleans a few common issues with generated JSON strings.

## Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* `AnyZodObject` |

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `text` | `string` | `undefined` | The JSON string to parse. |
| `schema` | `T` | `undefined` | The Zod schema to use for parsing. |
| `addDefaults` | `boolean` | `false` | Whether to add default values to the parsed object. |

## Returns

`Promise`\<`TypeOf`\<`T`\>\>

## Throws

If the JSON string is invalid or does not match the schema.
