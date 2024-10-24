import type { AgentFastReply } from '@dto/agent.ts'
import type { StrayCat } from '@lg'
import { catchError } from '@/errors.ts'
import { db } from '@db'
import { PromptTemplate } from '@langchain/core/prompts'
import { log } from '@logger'
import { normalizeMessageChunks, parseJson } from '@utils'
import _Merge from 'lodash/merge.js'
import _Unset from 'lodash/unset.js'
import { kebabCase } from 'scule'
import { z } from 'zod'

export enum FormState {
	/**
	 * The form is waiting for the user to confirm
	 */
	WAIT_CONFIRM,
	/**
	 * The form is incomplete
	 */
	INCOMPLETE,
	/**
	 * The form is complete
	 */
	COMPLETE,
	/**
	 * The form is cancelled by the user
	 */
	CLOSED,
}

type TModel = Record<string, any>

interface FormActionOptions<T extends TModel = TModel> {
	/**
	 * The current state of the form
	 */
	state: FormState
	/**
	 * The StrayCat instance linked to the form
	 */
	cat: StrayCat
	/**
	 * The current model of the form
	 */
	model: T
	/**
	 * The invalid fields of the form
	 */
	invalidFields: string[]
}

type FormSubmit<T extends TModel = TModel> = (output: T, cat: StrayCat) => Promise<AgentFastReply>

type FormAction<T extends TModel = TModel> = (current: FormActionOptions<T>) => Promise<AgentFastReply>

interface FormOptions<T extends TModel = TModel> {
	/**
	 * The description of the form
	 */
	description: string
	/**
	 * Examples to start the form
	 */
	startExamples: string[]
	/**
	 * Examples to stop the form
	 */
	stopExamples?: string[]
	/**
	 * Whether to ask the user for confirmation
	 */
	askConfirm?: boolean
	/**
	 * The agent reply to fill the form
	 */
	onAction?: FormAction<T>
	/**
	 * The function to call when the form is submitted
	 */
	onSubmit: FormSubmit<T>
}

export const isForm = (form: any): form is Form => form instanceof Form

export const CatForm = Object.freeze({
	/**
	 * Add a form to the plugin
	 * @param name the name of the form
	 * @param schema the validation schema of the form
	 * @param options the options of the form
	 * @returns the form instance
	 */
	add<T extends Record<string, z.ZodType>>(
		name: string,
		schema: T,
		options: FormOptions<z.infer<z.ZodObject<T>>>,
	) {
		return new Form(
			name,
			schema,
			options,
		)
	},
})

export class Form<
	T extends Record<string, z.ZodType> = Record<string, z.ZodType>,
	S extends z.infer<z.ZodObject<T>> = z.infer<z.ZodObject<T>>,
> {
	#cat!: StrayCat
	#state: FormState = FormState.INCOMPLETE
	#active = false
	name: string
	schema: z.ZodObject<T>
	model: S = {} as S
	submit: FormSubmit<S>
	askConfirm: boolean
	description: string
	startExamples: string[]
	stopExamples: string[]
	invalidFields: string[] = []

	constructor(name: string, schema: T, options: FormOptions<S>) {
		const { askConfirm = false, description, startExamples, stopExamples = [], onAction, onSubmit } = options
		this.name = kebabCase(name)
		this.schema = z.object(schema)
		this.askConfirm = askConfirm
		this.description = description
		this.startExamples = startExamples
		this.stopExamples = stopExamples
		this.submit = onSubmit
		if (onAction) this.message = onAction
	}

	get state() {
		return this.#state
	}

	get active() {
		return this.#active
	}

	set active(active: boolean) {
		this.#active = active
		db.update((db) => {
			if (this.#active) db.activeForms.add(this.name)
			else db.activeForms.delete(this.name)
		})
	}

	assignCat(cat: StrayCat) {
		this.#cat = cat
		return this
	}

	reset() {
		this.model = {} as S
		this.#state = FormState.INCOMPLETE
		this.invalidFields = []
	}

	async next(): Promise<AgentFastReply> {
		if (await this.checkExitIntent()) this.#state = FormState.CLOSED

		if (this.state === FormState.WAIT_CONFIRM) {
			const confirm = await this.askUserConfirm()
			if (confirm) {
				this.#state = FormState.CLOSED
				return await this.submit(this.model, this.#cat)
			}
			else this.#state = FormState.INCOMPLETE
		}

		if (this.state === FormState.INCOMPLETE) this.model = await this.update()

		if (this.state === FormState.COMPLETE) {
			if (this.askConfirm) this.#state = FormState.WAIT_CONFIRM
			else {
				this.#state = FormState.CLOSED
				return await this.submit(this.model, this.#cat)
			}
		}

		return await this.message({
			cat: this.#cat,
			model: this.model,
			state: this.state,
			invalidFields: this.invalidFields,
		})
	}

	private async message(current: FormActionOptions<S>): Promise<AgentFastReply> {
		const { invalidFields, model, state, cat } = current

		if (state === FormState.CLOSED) return await this.submit(model, cat)

		let infoOutput = `Info until now:\n${JSON.stringify(model, null, 4)}`

		if (invalidFields.length > 0) infoOutput += `\nInvalid fields: \n - ${invalidFields.join('\n - ')}`

		if (state === FormState.WAIT_CONFIRM) infoOutput += '\n --> Confirm? Yes or no?'

		return { output: infoOutput }
	}

	private async update() {
		let details = await this.extract()
		details = this.sanitize(details as S)
		let model = _Merge(this.model, details) as S
		model = this.validate(model) as S
		return model
	}

	private async extract(): Promise<S> {
		const history = this.stringifyChatHistory()

		const template = `Your task is to fill up a JSON out of a conversation.
The JSON must have this format:
\`\`\`json
{structure}
\`\`\`

This is the current JSON:
\`\`\`json
{model}
\`\`\`

This is the conversation:

{history}

Updated JSON:
\`\`\`json`

		log.debug(template)

		const prompt = new PromptTemplate({
			template,
			inputVariables: ['structure', 'model', 'history'],
		})
		const chain = prompt.pipe(this.#cat.currentLLM)

		let structure = '{'
		for (const key in this.schema.shape) {
			const zodType = ((this.schema.shape[key]!._def as any).typeName as string).replace('Zod', '').toLowerCase()
			structure += `\n\t"${key}": // ${this.schema.shape[key]!.description ?? ''} must be of type ${zodType}`
		}
		structure += '\n}'

		const [chainError, chainResponse] = await catchError(chain.invoke({ structure, history, model: this.model }))

		if (chainError) {
			log.error(chainError)
			return {} as S
		}

		const json = normalizeMessageChunks(chainResponse)

		const [error, output = {}] = await catchError(parseJson(json, this.schema), {
			errorsToCatch: [z.ZodError],
			logMessage: `Error while parsing JSON from form ${this.name}`,
		})

		if (!error) {
			log.debug('Form JSON after parsing:')
			log.dir(output)
		}

		return output as S
	}

	private async askUserConfirm() {
		const userMsg = this.#cat.lastUserMessage.text
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

		const res = normalizeMessageChunks(await this.#cat.llm(confirmPrompt))

		return JSON.stringify(res).toLowerCase().includes('true')
	}

	private async checkExitIntent() {
		const userMsg = this.#cat.lastUserMessage.text
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

User said: "${userMsg}"

JSON:
{
	"exit": `

		const res = normalizeMessageChunks(await this.#cat.llm(checkExitPrompt))

		return JSON.stringify(res).toLowerCase().includes('true')
	}

	private stringifyChatHistory() {
		const userMsg = this.#cat.lastUserMessage.text
		const chatHistory = this.#cat.getHistory(10)

		let history = chatHistory.map(m => `- ${m.role}: ${m.what}`).join('\n')
		history += `\nHuman: ${userMsg}`

		return history
	}

	private validate(model: S) {
		this.invalidFields = []

		const result = this.schema.safeParse(model)

		if (result.success) {
			this.#state = FormState.COMPLETE
			return result.data
		}
		else {
			this.#state = FormState.INCOMPLETE
			this.invalidFields = result.error.errors.map(e =>
				`${e.path.join('.')} (${e.message}, expected ${(e as any).expected})`,
			)
			return model
		}
	}

	private sanitize(model: S) {
		const nullFields = [null, undefined, '', 'null', 'undefined', 'NaN', 'lower-case', 'missing', 'unknown']
		for (const key in this.model)
			if (nullFields.includes(this.model[key])) _Unset(model, key)

		return model
	}
}
