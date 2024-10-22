[Overview](../index.md) / AgentManager

# AgentManager

Manager of Langchain Agent.
This class manages the Agent that uses the LLM. It takes care of formatting the prompt and filtering the tools
before feeding them to the Agent. It also instantiates the Langchain Agent.

## Constructors

### new AgentManager()

> **new AgentManager**(): [`AgentManager`](AgentManager.md)

#### Returns

[`AgentManager`](AgentManager.md)

## Methods

### executeAgent()

> **executeAgent**(`stray`): `Promise`\<[`AgentFastReply`](../interfaces/AgentFastReply.md)\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `stray` | [`StrayCat`](StrayCat.md) |

#### Returns

`Promise`\<[`AgentFastReply`](../interfaces/AgentFastReply.md)\>

***

### executeFormAgent()

> **executeFormAgent**(`stray`): `Promise`\<`undefined` \| [`AgentFastReply`](../interfaces/AgentFastReply.md)\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `stray` | [`StrayCat`](StrayCat.md) |

#### Returns

`Promise`\<`undefined` \| [`AgentFastReply`](../interfaces/AgentFastReply.md)\>

***

### executeMemoryChain()

> **executeMemoryChain**(`input`, `stray`): `Promise`\<`string`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`ContextInput`](../interfaces/ContextInput.md) |
| `stray` | [`StrayCat`](StrayCat.md) |

#### Returns

`Promise`\<`string`\>

***

### executeProceduresChain()

> **executeProceduresChain**(`agentInput`, `chatHistory`, `stray`): `Promise`\<[`AgentFastReply`](../interfaces/AgentFastReply.md)\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `agentInput` | [`ContextInput`](../interfaces/ContextInput.md) |
| `chatHistory` | `string` |
| `stray` | [`StrayCat`](StrayCat.md) |

#### Returns

`Promise`\<[`AgentFastReply`](../interfaces/AgentFastReply.md)\>

***

### executeTool()

> **executeTool**(`input`, `stray`): `Promise`\<`undefined` \| [`AgentFastReply`](../interfaces/AgentFastReply.md)\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`ContextInput`](../interfaces/ContextInput.md) |
| `stray` | [`StrayCat`](StrayCat.md) |

#### Returns

`Promise`\<`undefined` \| [`AgentFastReply`](../interfaces/AgentFastReply.md)\>

***

### getDeclarativeMemoriesPrompt()

> **getDeclarativeMemoriesPrompt**(`docs`): `string`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `docs` | [`MemoryDocument`](../type-aliases/MemoryDocument.md)[] |

#### Returns

`string`

***

### getEpisodicMemoriesPrompt()

> **getEpisodicMemoriesPrompt**(`docs`): `string`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `docs` | [`MemoryDocument`](../type-aliases/MemoryDocument.md)[] |

#### Returns

`string`

***

### getLangchainChatHistory()

> **getLangchainChatHistory**(`history`): `Promise`\<`BaseMessage`[]\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `history` | [`MemoryMessage`](../interfaces/MemoryMessage.md)[] |

#### Returns

`Promise`\<`BaseMessage`[]\>

***

### stringifyChatHistory()

> **stringifyChatHistory**(`history`): `string`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `history` | [`MemoryMessage`](../interfaces/MemoryMessage.md)[] |

#### Returns

`string`
