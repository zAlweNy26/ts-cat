import type { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager'
import type { BaseMessage } from '@langchain/core/messages'
import type { ChatResult } from '@langchain/core/outputs'
import { BaseChatModel, type BaseChatModelParams } from '@langchain/core/language_models/chat_models'
import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI } from '@langchain/openai'
import { ofetch } from 'ofetch'

export class DefaultLLM extends BaseChatModel {
	constructor(params?: BaseChatModelParams) {
		super(params ?? {})
	}

	_generate(messages: BaseMessage[]): Promise<ChatResult> {
		return Promise.resolve({
			generations: messages.map(message => ({
				text: 'You did not configure a Language Model. Do it in the settings!',
				message,
			})),
		})
	}

	_llmType(): string {
		return 'default'
	}
}

export class CustomLLM extends BaseChatModel {
	private url!: string
	private apiKey: string | undefined
	private options: Record<string, any> = {}

	constructor(params: BaseChatModelParams & { baseURL: string, apiKey?: string, options?: Record<string, any> }) {
		const { baseURL, apiKey, options, ...rest } = params
		super(rest)
		this.url = baseURL
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

export class CustomOpenAILLM extends ChatOpenAI {
	constructor(params: ConstructorParameters<typeof ChatOpenAI>[0] & { baseURL: string }) {
		const { baseURL, ...args } = params
		super(args, { baseURL })
	}

	_llmType(): string {
		return 'custom'
	}
}

export class CustomOllamaLLM extends ChatOllama {
	constructor(params: Omit<NonNullable<ConstructorParameters<typeof ChatOllama>[0]>, 'baseUrl'> & { baseURL: string }) {
		const { baseURL, ...args } = params
		super({
			...args,
			baseUrl: baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL,
		})
	}
}
