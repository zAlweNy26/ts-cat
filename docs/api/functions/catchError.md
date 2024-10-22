[Overview](../index.md) / catchError

# catchError()

> **catchError**\<`T`, `E`\>(`promise`, `options`?): `Promise`\<[`undefined`, `T`] \| [`InstanceType`\<`E`\>]\>

Catches errors from a promise.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `E` *extends* (...`args`) => `Error` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `promise` | `Promise`\<`T`\> | The promise to handle. |
| `options`? | `object` | Additional options for handling the promise. |
| `options.errorsToCatch`? | `E`[] | An optional array of error constructors to catch. |
| `options.logMessage`? | `string` | An optional message to log when an error occurs. |

## Returns

`Promise`\<[`undefined`, `T`] \| [`InstanceType`\<`E`\>]\>

A tuple with either the error or the result of the promise.

## Throws

Will rethrow the error if it is not in the `errorsToCatch` array.
