import type { DatabaseConfig } from '@db'
import type { LLMInteraction } from '@dto/message.ts'
import type { BaseCallbackHandlerInput } from '@langchain/core/callbacks/base'
import type { Serialized } from '@langchain/core/load/serializable'
import type { LLMResult } from '@langchain/core/outputs'
import type { StrayCat } from './stray-cat.ts'
import { db } from '@db'
import { BaseCallbackHandler } from '@langchain/core/callbacks/base'
import { rabbitHole } from '@rh'

export class NewTokenHandler extends BaseCallbackHandler {
	name = 'NewToken'

	constructor(private stray: StrayCat, input?: BaseCallbackHandlerInput) {
		super(input)
	}

	async handleLLMNewToken(token: string) {
		await this.stray.send({
			type: 'token',
			content: token,
		})
	}
}

export class ModelInteractionHandler extends BaseCallbackHandler {
	name = 'ModelInteraction'
	private lastInteraction: LLMInteraction

	constructor(private stray: StrayCat, source: string, input?: BaseCallbackHandlerInput) {
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
		await this.stray.addInteraction(this.lastInteraction)
	}
}

type RateLimitHandlerParams = Required<DatabaseConfig['rateLimiter']>

export class RateLimitHandler extends BaseCallbackHandler implements RateLimitHandlerParams {
	name = 'RateLimit'
	private checked = false
	availableTokens = 0
	lastRequest = 0
	tokensPerSecond: number
	checkInterval: number
	maxBucketSize: number
	enabled = false

	constructor(input?: BaseCallbackHandlerInput) {
		super(input)
		const { checkInterval, enabled, maxBucketSize, tokensPerSecond } = db.data.rateLimiter
		this.enabled = enabled ?? false
		this.checkInterval = checkInterval ?? 1
		this.maxBucketSize = maxBucketSize ?? 1000
		this.tokensPerSecond = tokensPerSecond ?? 1000
	}

	consume() {
		const now = Date.now()
		const timePassed = (now - this.lastRequest)

		if (timePassed * (this.tokensPerSecond / 1000) >= 1) {
			this.availableTokens += timePassed * (this.tokensPerSecond / 1000)
			this.lastRequest = now
		}

		this.availableTokens = Math.min(this.availableTokens, this.maxBucketSize)

		if (this.availableTokens >= 1) {
			this.availableTokens -= 1
			return true
		}

		return false
	}

	async acquire(blocking = true) {
		if (blocking) await Bun.sleep(this.checkInterval * 1000)
		return this.consume()
	}

	async handleChainStart() {
		if (!this.checked && this.enabled) {
			const result = await this.acquire()
			if (!result) throw new Error('Rate limit exceeded')
			this.checked = true
		}
	}

	async handleLLMStart() {
		if (!this.enabled) return
		const result = this.consume()
		if (!result) throw new Error('Rate limit exceeded')
	}
}
