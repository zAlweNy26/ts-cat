import type { PromptTemplateInput, TypedPromptInputValues } from '@langchain/core/prompts'
import { PromptTemplate } from '@langchain/core/prompts'
import type { InputValues } from '@langchain/core/utils/types'
import type { AgentStep } from 'langchain/agents'
import type { Form, Tool } from '@mh'
import _Random from 'lodash/random.js'

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
		const procedures = Object.values(this.procedures)

		if (procedures.map(p => p.startExamples).some(examples => examples.length > 0)) {
			values.examples = '## Here some examples:\n'
			values.examples += procedures.reduce((acc, p) => {
				const question = `${acc}\nQuestion: ${p.startExamples[_Random(p.startExamples.length - 1)]}`
				const example = JSON.stringify({
					action: p.name,
					actionInput: 'input of the action according to it\'s description',
				}, undefined, 4)
				return `${question}\n${example}\n`
			}, '')
		}

		values.agent_scratchpad = steps.reduce((acc, step) =>
			`${acc}\n${JSON.stringify({ observation: step.observation }, undefined, 4)}\n`, '')

		values.tools = procedures.map(p => `\t- ${p.name}: ${p.description}`).join('\n')

		values.tool_names = procedures.map(p => p.name).join(', ')

		return super.format(values)
	}
}

export const TOOL_PROMPT = `Answer the following question: \`{input}\`
You can only reply using these tools:
{tools}
	- final-answer: Use this to respond to the user when you have the final answer. Input is the final answer.
	- none-of-the-others: Use this tool if none of the others tools help. Input is always null.

If you want to do an action, use the following format:
{{
	"action": "action-name", // The name of the action to take, should be one of [{tool_names}, final-answer, none-of-the-others]
	"actionInput": "input of the action", // The input to the action, shoud be a string
}}

{examples}

## Begin!

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
