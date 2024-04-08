import { z } from 'zod'
import _Unset from 'lodash/unset.js'
import _Merge from 'lodash/merge.js'
import { safeDestr } from 'destr'
import { LLMChain } from 'langchain/chains'
import { PromptTemplate } from '@langchain/core/prompts'
import { kebabCase } from 'scule'
import type { AgentFastReply, StrayCat } from '@lg'
import { log } from '@logger'
import { parsedEnv } from '@utils'

export enum FormState {
	WAIT_CONFIRM,
	INCOMPLETE,
	COMPLETE,
	CLOSED,
}

interface FormOptions {
	description: string
	askConfirm?: boolean
	startExamples: string[]
	stopExamples?: string[]
}

type FormSubmit<T extends Record<string, any> = Record<string, any>> = (output: T, cat: StrayCat) => Promise<void>

export const isForm = (form: any): form is Form => form instanceof Form

export const CatForm = Object.freeze({
	/**
	 * Add a form to the plugin
	 * @param name the name of the form
	 * @param schema the validation schema of the form
	 * @param submit the function to execute when the form is submitted
	 * @param options the options of the form
	 * @returns the form instance
	 */
	add<T extends Record<string, z.ZodType>>(
		name: string,
		schema: T,
		submit: FormSubmit<z.infer<z.ZodObject<T>>>,
		options: FormOptions,
	) {
		return new Form(
			name,
			schema,
			submit,
			options,
		)
	},
})

export class Form<
	T extends Record<string, z.ZodType> = Record<string, z.ZodType>,
	S extends z.infer<z.ZodObject<T>> = z.infer<z.ZodObject<T>>,
> {
	private cat!: StrayCat
	private _state: FormState = FormState.INCOMPLETE
	active = true
	name: string
	schema: z.ZodObject<T>
	model: S = {} as S
	submit: FormSubmit<S>
	askConfirm: boolean
	description: string
	startExamples: string[]
	stopExamples: string[]
	errors: string[] = []
	missingFields: string[] = []

	constructor(name: string, schema: T, submit: FormSubmit<S>, options: FormOptions) {
		const { askConfirm = false, description, startExamples, stopExamples = [] } = options
		this.name = kebabCase(name)
		this.schema = z.object(schema)
		this.submit = submit
		this.askConfirm = askConfirm
		this.description = description
		this.startExamples = startExamples
		this.stopExamples = stopExamples
	}

	get state() {
		return this._state
	}

	assignCat(cat: StrayCat) {
		this.cat = cat
		return this
	}

	reset() {
		this.model = {} as S
		this._state = FormState.INCOMPLETE
		this.errors = []
		this.missingFields = []
	}

	private async askUserConfirm() {
		const userMsg = this.cat.lastUserMessage.text
		const confirmPrompt = `
		Your task is to produce a JSON representing whether a user is confirming or not.
JSON must be in this format:
{
    "confirm": // type boolean, must be "true" or "false" 
}

User said "${userMsg}"

JSON:
{
    "confirm": `

		const res = await this.cat.llm(confirmPrompt, true)

		return res.toLowerCase().includes('true')
	}

	private async checkExitIntent() {
		const history = this.stringifyChatHistory()
		let stopExamples = `Examples where { exit: true }:
- Exit form
- Stop form
- Stop it`

		stopExamples += this.stopExamples.map(e => `- ${e}`).join('\n')

		const checkExitPrompt = `Your task is to produce a JSON representing whether a user wants to exit or not.
JSON must be in this format:
{
	"exit": // type boolean, must be "true" or "false"
}

${stopExamples}

This is the conversation:

${history}

JSON:
{
	"exit": `

		const res = await this.cat.llm(checkExitPrompt, true)

		return res.toLowerCase().includes('true')
	}

	async next(): Promise<AgentFastReply> {
		if (await this.checkExitIntent()) { this._state = FormState.CLOSED }

		if (this.state === FormState.WAIT_CONFIRM) {
			const confirm = await this.askUserConfirm()
			if (confirm) {
				this._state = FormState.CLOSED
				await this.submit(this.model, this.cat)
				return { output: JSON.stringify(this.model, undefined, 4) }
			}
			else { this._state = FormState.INCOMPLETE }
		}

		if (this.state === FormState.INCOMPLETE) { this.model = await this.update() }

		if (this.state === FormState.COMPLETE) {
			if (this.askConfirm) { this._state = FormState.WAIT_CONFIRM }
			else {
				this._state = FormState.CLOSED
				await this.submit(this.model, this.cat)
				return { output: JSON.stringify(this.model, undefined, 4) }
			}
		}

		return this.message()
	}

	private async update() {
		let details = await this.extract()
		details = this.sanitize(details as S)
		let model = _Merge(this.model, details) as S
		model = this.validate(model) as S
		return model
	}

	private async extract() {
		const history = this.stringifyChatHistory()
		let structure = '{'
		for (const key in this.schema.shape) {
			const zodType = ((this.schema.shape[key]!._def as any).typeName as string).replace('Zod', '').toLowerCase()
			structure += `\n\t"${key}": // ${this.schema.shape[key]!.description ?? ''} must be of type ${zodType}`
		}
		structure += '\n}'
		const prompt = `Your task is to fill up a JSON out of a conversation.
The JSON must have this format:
${structure}

This is the current JSON:
${JSON.stringify(this.model, null, 4)}

This is the conversation:

${history}

Updated JSON:`

		log.debug(prompt)

		const extractionChain = new LLMChain({
			llm: this.cat.currentLLM,
			prompt: PromptTemplate.fromTemplate(prompt.replace('{', '{{').replace('}', '}}')),
			verbose: parsedEnv.verbose,
			outputKey: 'output',
		})

		const json = (await extractionChain.invoke({ stop: ['}'] })).output

		log.debug(`Form JSON after parser:\n${json}`)

		let output: Record<string, any> = {}
		try {
			output = safeDestr(json)
		}
		catch (error) {
			output = {}
			log.warn(error)
		}

		return output
	}

	private message(): AgentFastReply {
		if (this.state === FormState.CLOSED) { return { output: `Form ${this.name} closed` } }

		let missingFields = ''
		if (this.missingFields.length > 0) { missingFields = `\nMissing fields: \n - ${this.missingFields.join('\n - ')}` }

		let invalidFields = ''
		if (this.errors.length > 0) { invalidFields = `\nInvalid fields: \n - ${this.errors.join('\n - ')}` }

		let infoOutput = `Info until now:
${JSON.stringify(this.model, null, 4)}
${missingFields}
${invalidFields}`

		if (this.state === FormState.WAIT_CONFIRM) { infoOutput += '\n --> Confirm? Yes or no?' }

		return { output: infoOutput }
	}

	private stringifyChatHistory() {
		const userMsg = this.cat.lastUserMessage.text
		const chatHistory = this.cat.getHistory(10)

		let history = chatHistory.map(m => `- ${m.who}: ${m.what}`).join('\n')
		history += `\nHuman: ${userMsg}`

		return history
	}

	private validate(model: S) {
		this.missingFields = []
		this.errors = []

		const result = this.schema.safeParse(model)

		if (result.success) {
			this._state = FormState.COMPLETE
			return result.data
		}
		else {
			this._state = FormState.INCOMPLETE
			this.errors = result.error.errors.map(e => e.message)
			this.missingFields = result.error.errors.map(e => e.path.join('.'))
			for (const key of this.missingFields) { _Unset(model, key) }
			return model
		}
	}

	private sanitize(model: S) {
		const nullFields = [null, undefined, '', 'null', 'undefined', 'NaN', 'lower-case', 'missing', 'unknown']
		for (const key in this.model) {
			if (nullFields.includes(this.model[key])) { _Unset(model, key) }
		}
		return model
	}
}
