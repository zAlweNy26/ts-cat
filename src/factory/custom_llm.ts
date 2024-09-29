import type { BaseLLMParams } from '@langchain/core/language_models/llms'
import type { BaseMessage } from '@langchain/core/messages'
import type { ChatResult } from '@langchain/core/outputs'
import { join } from 'node:path'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { ChatOpenAI } from '@langchain/openai'

export class DefaultLLM extends BaseChatModel {
	constructor(params?: BaseLLMParams) {
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

export class CustomOpenAILLM extends ChatOpenAI {
	public url = ''
	public openAIApiBase = ''

	constructor(params?: ConstructorParameters<typeof ChatOpenAI>[0]) {
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
		this.openAIApiBase = join(this.url, 'v1')
	}
}
