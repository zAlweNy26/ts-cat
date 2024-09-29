import type { LLMInteraction } from '@dto/message.ts'
import type { BaseCallbackHandlerInput } from '@langchain/core/callbacks/base'
import type { Serialized } from '@langchain/core/load/serializable'
import type { LLMResult } from '@langchain/core/outputs'
import type { StrayCat } from './stray-cat.ts'
import { BaseCallbackHandler } from '@langchain/core/callbacks/base'
import { rabbitHole } from '@rh'

export class NewTokenHandler extends BaseCallbackHandler {
	name = 'NewToken'

	constructor(public stray: StrayCat, input?: BaseCallbackHandlerInput) {
		super(input)
	}

	handleLLMNewToken(token: string) {
		this.stray.send({
			type: 'token',
			content: token,
		})
	}
}

export class ModelInteractionHandler extends BaseCallbackHandler {
	name = 'ModelInteraction'
	private lastInteraction: LLMInteraction

	constructor(public stray: StrayCat, public source: string, input?: BaseCallbackHandlerInput) {
		super(input)
		this.lastInteraction = {
			model: 'llm',
			startedAt: Date.now(),
			endedAt: Date.now(),
			inputTokens: 0,
			outputTokens: 0,
			prompt: '',
			reply: '',
			source,
		}
	}

	private async countTokens(prompt: string) {
		const len = await rabbitHole.textSplitter.lengthFunction(prompt)
		return len
	}

	async handleLLMStart(_llm: Serialized, prompts: string[]) {
		let tokens = 0
		for (const prompt of prompts) tokens += await this.countTokens(prompt)
		this.lastInteraction.prompt = prompts.join('')
		this.lastInteraction.inputTokens = tokens
	}

	async handleLLMEnd(output: LLMResult) {
		this.lastInteraction.reply = output.generations[0]?.[0]?.text ?? ''
		this.lastInteraction.outputTokens = await this.countTokens(this.lastInteraction.reply)
		this.lastInteraction.endedAt = Date.now()
		this.stray.addInteraction(this.lastInteraction)
	}
}
