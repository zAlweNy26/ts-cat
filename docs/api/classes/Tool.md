[Overview](../index.md) / Tool

# Tool

## Extends

- `DynamicStructuredTool`\<*typeof* `toolSchema`\>

## Constructors

### new Tool()

> **new Tool**(`name`, `description`, `fn`, `options`?): [`Tool`](Tool.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |
| `description` | `string` |
| `fn` | `ToolFun` |
| `options`? | `ToolOptions` |

#### Returns

[`Tool`](Tool.md)

#### Overrides

`DynamicStructuredTool<typeof toolSchema>.constructor`

## Properties

| Property | Type |
| ------ | ------ |
| `startExamples` | `string`[] |

## Accessors

### active

> `get` **active**(): `boolean`

> `set` **active**(`active`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `active` | `boolean` |

#### Returns

`boolean`

## Methods

### assignCat()

> **assignCat**(`cat`): [`Tool`](Tool.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `cat` | [`StrayCat`](StrayCat.md) |

#### Returns

[`Tool`](Tool.md)

***

### invoke()

> **invoke**(`input`, `config`?): `Promise`\<`string`\>

Invokes the tool with the provided input and configuration.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` \| `object` | The input for the tool. |
| `config`? | `RunnableConfig`\<`Record`\<`string`, `any`\>\> | Optional configuration for the tool. |

#### Returns

`Promise`\<`string`\>

A Promise that resolves with a string.

#### Overrides

`DynamicStructuredTool.invoke`
