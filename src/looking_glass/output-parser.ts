import type { AgentAction, AgentFinish } from 'langchain/agents'
import { catchError } from '@/errors.ts'
import { OutputParserException } from '@langchain/core/output_parsers'
import { madHatter } from '@mh'
import { parseJson } from '@utils'
import { AgentActionOutputParser } from 'langchain/agents'
import { z } from 'zod'

const agentOutputSchema = z.object({
	action: z.string(),
	actionInput: z.string().nullish().transform((v) => {
		if (typeof v === 'string') {
			const str = v.trim().replace(/^['"]|['"]$/g, '').replace(/None|undefined/g, 'null')
			return str === 'null' ? null : str
		}
		return null
	}),
})

export class ProceduresOutputParser extends AgentActionOutputParser {
	lc_namespace = ['looking_glass', 'procedures-output-parser']

	async parse(output: string): Promise<AgentFinish | AgentAction> {
		const [parseError, parsedOutput] = await catchError(
			parseJson(output, agentOutputSchema),
			{ errorsToCatch: [OutputParserException], logMessage: `Could not parse LLM output: ${output}` },
		)

		if (parseError) {
			return {
				log: output,
				returnValues: {
					output: null,
				},
			}
		}

		const parsedLog = JSON.stringify(parsedOutput, null, 4)

		const { action, actionInput } = parsedOutput

		if (action === 'final-answer') {
			return {
				log: parsedLog,
				returnValues: {
					output: null,
				},
			}
		}

		const form = madHatter.forms.find(f => f.name === action)

		if (form) {
			return {
				log: parsedLog,
				returnValues: {
					output: null,
					form: action,
				},
			}
		}

		return {
			log: parsedLog,
			tool: action,
			toolInput: actionInput ?? {},
		}
	}

	getFormatInstructions() {
		return `{
            "action": "string",
			"actionInput": "string" // or null if not needed
        }`
	}
}
