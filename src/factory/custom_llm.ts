import type { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager'
import type { BaseChatModelParams } from '@langchain/core/language_models/chat_models'
import type { BaseMessage } from '@langchain/core/messages'
import type { ChatResult } from '@langchain/core/outputs'
import { BaseChatModel, SimpleChatModel } from '@langchain/core/language_models/chat_models'
import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI } from '@langchain/openai'
import { ofetch } from 'ofetch'

export class FakeChat extends SimpleChatModel {
	constructor(params?: BaseChatModelParams) {
		super(params ?? {})
	}

	async _call(): Promise<string> {
		return 'You did not configure a Language Model. Do it in the settings!'
	}

	_llmType(): string {
		return 'default'
	}
}

export class CustomChat extends BaseChatModel {
	private url!: string
	private apiKey: string | undefined
	private options: Record<string, any> = {}

	constructor(params: BaseChatModelParams & { baseUrl: string, apiKey?: string, options?: Record<string, any> }) {
		const { baseUrl, apiKey, options, ...rest } = params
		super(rest)
		this.url = baseUrl
		this.apiKey = apiKey
		this.options = options ?? {}
	}

	async _generate(messages: BaseMessage[], _options: this['ParsedCallOptions'], _runManager?: CallbackManagerForLLMRun): Promise<ChatResult> {
		const res = await ofetch<ChatResult>(this.url, {
			method: 'POST',
			body: {
				messages,
				apiKey: this.apiKey,
				options: this.options,
			},
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		})

		return res
	}

	_llmType(): string {
		return 'custom'
	}

	_identifyingParams(): Record<string, any> {
		return {
			url: this.url,
			apiKey: this.apiKey,
			options: this.options,
		}
	}
}

export class CustomChatOpenAI extends ChatOpenAI {
	constructor(params: ConstructorParameters<typeof ChatOpenAI>[0] & { baseUrl: string }) {
		const { baseUrl, ...args } = params
		super({
			...args,
			configuration: {
				baseURL: baseUrl,
			},
		})
	}

	_llmType(): string {
		return 'custom'
	}
}

export class CustomChatOllama extends ChatOllama {
	constructor(params: NonNullable<ConstructorParameters<typeof ChatOllama>[0]> & { baseUrl: string }) {
		const { baseUrl, ...args } = params
		super({
			...args,
			baseUrl: baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl,
		})
	}
}
