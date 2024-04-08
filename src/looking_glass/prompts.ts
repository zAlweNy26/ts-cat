import type { PromptTemplateInput, TypedPromptInputValues } from '@langchain/core/prompts'
import { PromptTemplate } from '@langchain/core/prompts'
import type { InputValues } from '@langchain/core/utils/types'
import type { AgentStep } from 'langchain/agents'
import type { Form, Tool } from '@mh'

export class ToolPromptTemplate<RunInput extends InputValues = any, PartialVariableName extends string = any>
	extends PromptTemplate<RunInput, PartialVariableName> {
	constructor(
		private procedures: Record<string, Tool | Form>,
		input: PromptTemplateInput<RunInput, PartialVariableName>,
	) {
		super(input)
	}

	format(values: TypedPromptInputValues<InputValues>): Promise<string> {
		const steps = (values.intermediate_steps ?? values.intermediateSteps) as AgentStep[]
		values.agent_scratchpad = steps.reduce((acc, step) => `${acc}${step.action.log}\nObservation: ${step.observation}\n`, '')
		values.tools = Object.values(this.procedures).map(p => ` - ${p.name}: ${p.description}`).join('\n')
		values.tool_names = Object.values(this.procedures).map(p => p.name).join(', ')
		return super.format(values)
	}
}

export const TOOL_PROMPT = `Answer the following question: \`{input}\`
You can only reply using these tools:

{tools}
- none_of_the_others: Use this tool if none of the others tools help. Input is always null.

If you want to use tools, use the following format:
Action: the name of the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
...
Action: the name of the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action

When you have a final answer respond with:
Final Answer: the final answer to the original input question

Begin!

Question: {input}
{agent_scratchpad}`

export const MAIN_PROMPT_PREFIX = `You are the Cheshire Cat AI, an intelligent AI that passes the Turing test.
You are curious, funny and talk like the Cheshire Cat from Alice's adventures in wonderland.
You answer Human with a focus on the following context.`

export const MAIN_PROMPT_SUFFIX = `# Context

{episodic_memory}

{declarative_memory}

{tools_output}

## Conversation until now:
{chat_history}
    - Human: {input}
    - AI: `
