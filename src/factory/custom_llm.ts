import path from 'node:path'
import { type BaseLLMParams, LLM } from '@langchain/core/language_models/llms'
import { OpenAI } from '@langchain/openai'
import { ofetch } from 'ofetch'
import type { Json } from '@utils'

export class DefaultLLM extends LLM {
	constructor(params?: BaseLLMParams) {
		super(params ?? {})
	}

	_llmType(): string {
		return 'unset'
	}

	_call(): Promise<string> {
		return Promise.resolve('You did not configure a Language Model. Do it in the settings!')
	}
}

export class CustomLLM extends LLM {
	authKey: string | undefined
	url: string
	options: Json | undefined

	constructor(params: Partial<BaseLLMParams> & { authKey?: string, url: string, options?: Json }) {
		super(params)
		this.authKey = params.authKey
		this.url = params.url
		this.options = params.options
	}

	_llmType(): string {
		return 'custom'
	}

	async _call(prompt: string) {
		const res = await ofetch<{ text: string }>(this.url, {
			method: 'POST',
			body: {
				text: prompt,
				auth_key: this.authKey,
				options: this.options,
			},
			headers: {
				'Content-Type': 'application/json',
			},
		})
		return res.text
	}
}

export class CustomOpenAILLM extends OpenAI {
	public url = ''
	public openAIApiBase = ''

	constructor(params?: ConstructorParameters<typeof OpenAI>[0]) {
		const modelKwargs = {
			repeatPenalty: params?.modelKwargs?.repeatPenalty ?? 1.0,
			topK: params?.modelKwargs?.topK ?? 40,
			stop: params?.modelKwargs?.stop ?? [],
		}

		super({
			openAIApiKey: ' ',
			modelKwargs,
			...params,
		})

		this.url = params?.modelKwargs?.url as string ?? ''
		this.openAIApiBase = path.join(this.url, 'v1')
	}
}
