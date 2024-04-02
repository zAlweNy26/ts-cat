import { AgentActionOutputParser } from 'langchain/agents'
import type { AgentAction, AgentFinish } from 'langchain/schema'
import { madHatter } from '@mh'
import { log } from '@logger'

export class ProceduresOutputParser extends AgentActionOutputParser {
	lc_namespace = ['looking_glass', 'output-parser']

	async parse(output: string): Promise<AgentFinish | AgentAction> {
		if (output.includes('Final Answer:')) {
			return {
				log: output,
				returnValues: {
					output: output.split('Final Answer:').at(-1)?.trim(),
				},
			}
		}

		const regex = /Action\s*\d*\s*:(.*?)\nAction\s*\d*\s*Input\s*\d*\s*:[\s]*(.*)/g
		const matches = [...output.matchAll(regex)][0]
		if (!matches) {
			log.error(`Could not parse LLM output: ${output}`)
			return {
				log: output,
				returnValues: {
					output: null,
				},
			}
		}

		const action = matches[1]?.trim(), actionInput = matches[2]?.trim()

		if (!action || action === 'none_of_the_others') {
			return {
				log: output,
				returnValues: {
					output: null,
				},
			}
		}

		const forms = madHatter.forms.filter(f => f.name === action)

		if (forms.length > 0) {
			return {
				log: output,
				returnValues: {
					output: null,
					form: action,
				},
			}
		}

		return {
			log: output,
			tool: action,
			toolInput: actionInput ?? '',
		}
	}

	getFormatInstructions() {
		return `{
            "output": "string"
        }`
	}
}
