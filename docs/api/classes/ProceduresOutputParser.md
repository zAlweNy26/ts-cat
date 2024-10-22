[Overview](../index.md) / ProceduresOutputParser

# ProceduresOutputParser

## Extends

- `AgentActionOutputParser`

## Constructors

### new ProceduresOutputParser()

> **new ProceduresOutputParser**(`kwargs`?, ...`_args`?): [`ProceduresOutputParser`](ProceduresOutputParser.md)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `kwargs`? | `SerializedFields` |
| ...`_args`? | `never`[] |

#### Returns

[`ProceduresOutputParser`](ProceduresOutputParser.md)

#### Inherited from

`AgentActionOutputParser.constructor`

## Properties

| Property | Type | Description | Overrides |
| ------ | ------ | ------ | ------ |
| `lc_namespace` | `string`[] | A path to the module that contains the class, eg. ["langchain", "llms"] Usually should be the same as the entrypoint the class is exported from. | `AgentActionOutputParser.lc_namespace` |

## Methods

### getFormatInstructions()

> **getFormatInstructions**(): `string`

Return a string describing the format of the output.

#### Returns

`string`

Format instructions.

#### Example

```json
{
 "foo": "bar"
}
```

#### Overrides

`AgentActionOutputParser.getFormatInstructions`

***

### parse()

> **parse**(`output`): `Promise`\<`AgentAction` \| `AgentFinish`\>

Parse the output of an LLM call.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `output` | `string` |

#### Returns

`Promise`\<`AgentAction` \| `AgentFinish`\>

Parsed output.

#### Overrides

`AgentActionOutputParser.parse`
