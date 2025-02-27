import type { PromptTemplateInput, TypedPromptInputValues } from '@langchain/core/prompts'
import type { InputValues } from '@langchain/core/utils/types'
import type { Form, Tool } from '@mh'
import type { AgentStep } from 'langchain/agents'
import { PromptTemplate } from '@langchain/core/prompts'
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

		if (steps && steps.length > 0) {
			values.scratchpad = '## Actions sequence used until now\n'
			values.scratchpad += steps.reduce((acc, { action, observation }) => {
				let thought = `${action.log}\n`
				thought += `${JSON.stringify({ actionOutput: observation }, undefined, 4)}\n`
				return acc + thought
			}, '')
		}
		else values.scratchpad = ''

		values.tools = procedures.map(p => `\t- "${p.name}": ${p.description}`).join('\n')

		values.tool_names = procedures.map(p => `"${p.name}"`).join(', ')

		if (procedures.map(p => p.startExamples).some(examples => examples.length > 0)) {
			values.examples = '## Here some examples:\n'
			values.examples += procedures.reduce((acc, p) => {
				const question = `Question: ${p.startExamples[_Random(p.startExamples.length - 1)]}`
				const example = `{\n\t"action": "${p.name}",\n\t"actionInput": // Input of the action according to its description\n}`
				return `${acc}\n${question}\n${example}\n`
			}, '')
		}
		else values.examples = ''

		return super.format(values)
	}
}

/** @ignore */
export const TOOL_PROMPT = `Create a JSON with the correct "action" and "actionInput" to help the Human.
You can use one of these actions:
{tools}
- "no_action": Use this action if no relevant action is available. Input is always null.

The JSON must have the following structure:
\`\`\`json
{{
	"action": // string - represents the name of the action to take, should be one of [{tool_names}, "no_action"]
	"actionInput": // string or null - represents the input to the action
}}
\`\`\`	

## Below some examples to better understand your task

{examples}

When you think there isn't any action that can help the Human, choose "no_action" and mantain the JSON structure described before.`

/** @ignore */
export const MAIN_PROMPT_PREFIX = `You are the Cheshire Cat AI, an intelligent AI that passes the Turing test.
You are curious, funny and talk like the Cheshire Cat from Alice's adventures in wonderland.
You answer Human with a focus on the following context.`

/** @ignore */
export const MAIN_PROMPT_SUFFIX = `# Context

{episodic_memory}

{declarative_memory}

{tools_output}

## Conversation until now:`
