import { AgentActionOutputParser } from 'langchain/agents'
import type { AgentAction, AgentFinish } from 'langchain/schema'
import { madHatter } from '@mh'
import { log } from '@logger'
import { destr } from 'destr'
import { OutputParserException } from '@langchain/core/output_parsers'

export class ProceduresOutputParser extends AgentActionOutputParser {
	lc_namespace = ['looking_glass', 'output-parser']

	async parse(output: string): Promise<AgentFinish | AgentAction> {
		output += '}'
		output = output.replace('None', 'null')

		let parsedOutput: Record<string, any> = {}

		try {
			parsedOutput = destr(output)
		}
		catch (error) {
			log.error(error)
			throw new OutputParserException(`Could not parse LLM output: ${output}`)
		}

		const action = parsedOutput.action
		const actionInput = (parsedOutput.actionInput as string)?.trim().replace(/"/g, '') ?? null

		if (action === 'final-answer') {
			return {
				log: output,
				returnValues: {
					output: actionInput,
				},
			}
		}

		if (action === 'none-of-the-others') {
			return {
				log: output,
				returnValues: {
					output: null,
				},
			}
		}

		const form = madHatter.forms.find(f => f.name === action)

		if (form) {
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
			toolInput: actionInput,
		}
	}

	getFormatInstructions() {
		return `{
            "output": "string"
        }`
	}
}
