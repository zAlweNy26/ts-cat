[Overview](../index.md) / compareStrings

# compareStrings()

> **compareStrings**(`input`, `prediction`, `criteria`?): `Promise`\<`number`\>

Compares two strings using an evaluator.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` | The input string to compare. |
| `prediction` | `string` | The prediction string to use for comparison. |
| `criteria`? | `CriteriaLike` | Optional criteria for the evaluator. |

## Returns

`Promise`\<`number`\>

The score of the comparison. 0 means the strings are identical.
