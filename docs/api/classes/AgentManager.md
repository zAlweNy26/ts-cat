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

Executes the agent's main logic flow, including hooks, tools, forms, procedures, and memory chains.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `stray` | [`StrayCat`](StrayCat.md) | The `StrayCat` instance. |

#### Returns

`Promise`\<[`AgentFastReply`](../interfaces/AgentFastReply.md)\>

An `AgentFastReply` object containing the agent's output and any intermediate steps.

***

### executeFormAgent()

> **executeFormAgent**(`stray`): `Promise`\<`undefined` \| [`AgentFastReply`](../interfaces/AgentFastReply.md)\>

Executes the form associated with the given stray cat.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `stray` | [`StrayCat`](StrayCat.md) | The `StrayCat` instance whose form is to be executed. |

#### Returns

`Promise`\<`undefined` \| [`AgentFastReply`](../interfaces/AgentFastReply.md)\>

The result of the next step of the form or `undefined` if no form is found.

***

### executeMemoryChain()

> **executeMemoryChain**(`input`, `stray`): `Promise`\<`string`\>

Executes a memory chain. It uses the prompt prefix and suffix to format the prompt and then
passes it to the LLM.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | [`ContextInput`](../interfaces/ContextInput.md) | The context input to be processed by the memory chain. |
| `stray` | [`StrayCat`](StrayCat.md) | The `StrayCat` instance. |

#### Returns

`Promise`\<`string`\>

A promise that resolves with the result of the memory chain invocation.

***

### executeProceduresChain()

> **executeProceduresChain**(`agentInput`, `chatHistory`, `stray`): `Promise`\<[`AgentFastReply`](../interfaces/AgentFastReply.md)\>

Executes the procedures chain. It gets the tools and forms and passes them to the agent.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `agentInput` | [`ContextInput`](../interfaces/ContextInput.md) | The input context for the agent. |
| `chatHistory` | `string` | The history of the chat as a string. |
| `stray` | [`StrayCat`](StrayCat.md) | The `StrayCat` instance. |

#### Returns

`Promise`\<[`AgentFastReply`](../interfaces/AgentFastReply.md)\>

An `AgentFastReply` object containing the result of the procedure chain execution.

***

### executeTool()

> **executeTool**(`input`, `stray`): `Promise`\<`undefined` \| [`AgentFastReply`](../interfaces/AgentFastReply.md)\>

Executes a tool based on the provided input.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | [`ContextInput`](../interfaces/ContextInput.md) | The context input containing the command or query. |
| `stray` | [`StrayCat`](StrayCat.md) | The `StrayCat` instance to be used with the tool. |

#### Returns

`Promise`\<`undefined` \| [`AgentFastReply`](../interfaces/AgentFastReply.md)\>

An `AgentFastReply` containing the tool's output and intermediate steps, or `undefined` if no tool is executed.

***

### getDeclarativeMemoriesPrompt()

> **getDeclarativeMemoriesPrompt**(`docs`): `string`

Generates a prompt string that summarizes declarative memories from the provided documents.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `docs` | [`MemoryDocument`](../type-aliases/MemoryDocument.md)[] | An array of `MemoryDocument` objects. |

#### Returns

`string`

A formatted string that includes the context of the documents with relevant information.
         If no documents are provided, an empty string is returned.

***

### getEpisodicMemoriesPrompt()

> **getEpisodicMemoriesPrompt**(`docs`): `string`

Generates a prompt string that summarizes episodic memories from the provided documents.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `docs` | [`MemoryDocument`](../type-aliases/MemoryDocument.md)[] | An array of `MemoryDocument` objects containing the episodic memories. |

#### Returns

`string`

A formatted string that includes the context of things the user said in the past.
			If the contents of the documents are empty, an empty string is returned.

***

### getLangchainChatHistory()

> **getLangchainChatHistory**(`history`): `Promise`\<`BaseMessage`[]\>

Converts an array of `MemoryMessage` into LangChain `BaseMessage` objects.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `history` | [`MemoryMessage`](../type-aliases/MemoryMessage.md)[] | An array of `MemoryMessage` objects representing the chat history. |

#### Returns

`Promise`\<`BaseMessage`[]\>

An array of messages from the LangChain's `ChatMessageHistory` instance.

***

### stringifyChatHistory()

> **stringifyChatHistory**(`history`): `string`

Converts an array of `MemoryMessage` objects into a formatted string.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `history` | [`MemoryMessage`](../type-aliases/MemoryMessage.md)[] | An array of `MemoryMessage` objects representing the chat history. |

#### Returns

`string`

A string containing the formatted chat history.
