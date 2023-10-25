import path from 'node:path'
import { LLM } from '@langchain/core/language_models/llms'
import { OpenAI } from '@langchain/openai'
import { ofetch } from 'ofetch'

export class DefaultLLM extends LLM {
	_llmType(): string {
		return 'default'
	}

	_call(): Promise<string> {
		return Promise.resolve('AI: You did not configure a Language Model.\nDo it in the settings!')
	}
}

export class CustomLLM extends LLM {
	authKey = ''
	url = ''
	options: Record<string, unknown> = {}

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
