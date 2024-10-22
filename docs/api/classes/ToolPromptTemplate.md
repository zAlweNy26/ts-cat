[Overview](../index.md) / ToolPromptTemplate

# ToolPromptTemplate\<RunInput, PartialVariableName\>

## Extends

- `PromptTemplate`\<`RunInput`, `PartialVariableName`\>

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `RunInput` *extends* `InputValues` | `any` |
| `PartialVariableName` *extends* `string` | `any` |

## Constructors

### new ToolPromptTemplate()

> **new ToolPromptTemplate**\<`RunInput`, `PartialVariableName`\>(`procedures`, `input`): [`ToolPromptTemplate`](ToolPromptTemplate.md)\<`RunInput`, `PartialVariableName`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `procedures` | `Record`\<`string`, [`Tool`](Tool.md) \| [`Form`](Form.md)\<`Record`\<`string`, `ZodType`\<`any`, `ZodTypeDef`, `any`\>\>, `object`\>\> |
| `input` | `PromptTemplateInput`\<`RunInput`, `PartialVariableName`, `TemplateFormat`\> |

#### Returns

[`ToolPromptTemplate`](ToolPromptTemplate.md)\<`RunInput`, `PartialVariableName`\>

#### Overrides

`PromptTemplate<RunInput, PartialVariableName>.constructor`

## Methods

### format()

> **format**(`values`): `Promise`\<`string`\>

Formats the prompt template with the provided values.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `values` | `TypedPromptInputValues`\<`InputValues`\> | The values to be used to format the prompt template. |

#### Returns

`Promise`\<`string`\>

A promise that resolves to a string which is the formatted prompt.

#### Overrides

`PromptTemplate.format`
