[Overview](../index.md) / getZodDefaults

# getZodDefaults()

> **getZodDefaults**\<`T`\>(`schema`, `discriminant`?): `undefined` \| `T`\[`"_output"`\]

Retrieves the default values for a given Zod schema.

## Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* `ZodTypeAny` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `schema` | `T` | The Zod schema for which to retrieve the default values. |
| `discriminant`? | `string` | The discriminant value for discriminated unions. |

## Returns

`undefined` \| `T`\[`"_output"`\]
