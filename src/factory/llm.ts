import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { db } from '@db'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatCohere } from '@langchain/cohere'
import { BedrockChat } from '@langchain/community/chat_models/bedrock'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatMistralAI } from '@langchain/mistralai'
import { ChatOllama } from '@langchain/ollama'
import { AzureChatOpenAI, ChatOpenAI } from '@langchain/openai'
import { madHatter } from '@mh'
import { z } from 'zod'
import { CustomChat, CustomChatOllama, CustomChatOpenAI, FakeChat } from './custom_llm.ts'

interface LLMSettings<Config extends z.ZodTypeAny> {
	name: string
	description: string
	link?: string
	config: Config
	model: new (params: z.output<Config>) => BaseChatModel
}

export class ChatModelConfig<Config extends z.ZodTypeAny = z.ZodTypeAny> {
	constructor(private _settings: LLMSettings<Config>) {}

	get info() {
		return {
			id: this._settings.model.name,
			name: this._settings.name,
			description: this._settings.description,
			link: this._settings.link,
		}
	}

	get config() {
		return this._settings.config
	}

	initModel(params: z.input<Config>) {
		const { model, config } = this._settings
		const Model = model
		return new Model(config.parse(params))
	}
}

export function addChatModel<Config extends z.ZodTypeAny>(settings: LLMSettings<Config>) {
	return new ChatModelConfig<Config>(settings)
}

const fakeLLMConfig = addChatModel({
	name: 'Default Language Model',
	description: 'A dumb LLM just telling that the Cat is not configured. There will be a nice LLM here once consumer hardware allows it.',
	config: z.object({}),
	model: FakeChat,
})

const customLLMConfig = addChatModel({
	name: 'Custom Language Model',
	description: 'Configuration for custom language model',
	config: z.object({
		baseUrl: z.string().url(),
		apiKey: z.string(),
		options: z.record(z.any()).default({}),
	}),
	model: CustomChat,
})

const customOllamaLLMConfig = addChatModel({
	name: 'Custom Ollama',
	description: 'Configuration for Ollama language model',
	config: z.object({
		baseUrl: z.string().url(),
		model: z.string().default('llama2'),
		numCtx: z.number().int().gte(1).default(2045),
		temperature: z.number().gte(0).lte(1).default(0.8),
		repeatPenalty: z.number().gte(-2).lte(2).default(1.1),
		repeatLastN: z.number().int().gte(1).default(64),
	}),
	model: CustomChatOllama,
})

const customOpenAILLMConfig = addChatModel({
	name: 'Custom OpenAI-compatible API',
	description: 'Configuration for self-hosted OpenAI-compatible API server, e.g. llama-cpp-python server, text-generation-webui, OpenRouter, TinyLLM, etc...',
	config: z.object({
		baseUrl: z.string().url(),
		temperature: z.number().gte(0).lte(1).default(0.1),
		maxTokens: z.number().int().gte(1).default(512),
		stop: z.string().default('Human:,###').transform(s => s.split(',')),
		topP: z.number().gte(0).lte(1).default(0.95),
		frequencyPenalty: z.number().gte(-2).lte(2).default(1.1),
		modelKwargs: z.record(z.any()).default({ topK: 40 }),
	}),
	model: CustomChatOpenAI,
})

const chatOpenAILLMConfig = addChatModel({
	name: 'OpenAI ChatGPT',
	description: 'Configuration for OpenAI ChatGPT language model',
	link: 'https://platform.openai.com/docs/models/overview',
	config: z.object({
		apiKey: z.string(),
		model: z.string().default('gpt-3.5-turbo'),
		temperature: z.number().gte(0).lte(1).default(0.7),
		streaming: z.boolean().default(false),
	}),
	model: ChatOpenAI,
})

const azureChatOpenAILLMConfig = addChatModel({
	name: 'Azure OpenAI',
	description: 'Chat model from Azure OpenAI',
	link: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service',
	config: z.object({
		apiKey: z.string(),
		base: z.string(),
		deployment: z.string(),
		model: z.string().default('gpt-35-turbo'),
		maxTokens: z.number().int().gte(1).default(2048),
		version: z.string().default('2023-05-15'),
		streaming: z.boolean().default(false),
	}),
	model: AzureChatOpenAI,
})

const cohereLLMConfig = addChatModel({
	name: 'Cohere',
	description: 'Configuration for Cohere language model',
	link: 'https://docs.cohere.com/docs/models',
	config: z.object({
		apiKey: z.string(),
		model: z.string().default('command'),
		temperature: z.number().gte(0).lte(1).default(0.7),
	}),
	model: ChatCohere,
})

const mistralAILLMConfig = addChatModel({
	name: 'MistralAI',
	description: 'Configuration for MistralAI language model',
	link: 'https://www.together.ai',
	config: z.object({
		apiKey: z.string(),
		model: z.string().default('mistral-small-latest'),
		maxTokens: z.number().int().gte(1).default(4096),
		topP: z.number().gte(0).lte(1).default(0.95),
		temperature: z.number().gte(0).lte(1).default(0.7),
		streaming: z.boolean().default(false),
	}),
	model: ChatMistralAI,
})

const anthropicLLMConfig = addChatModel({
	name: 'Anthropic',
	description: 'Configuration for Anthropic Claude model',
	link: 'https://www.anthropic.com/claude',
	config: z.object({
		apiKey: z.string(),
		model: z.string().default('claude-3-opus-20240229'),
		maxTokens: z.number().int().gte(1).default(4096),
		temperature: z.number().gte(0).lte(1).default(0.7),
		streaming: z.boolean().default(false),
	}),
	model: ChatAnthropic,
})

const ollamaLLMConfig = addChatModel({
	name: 'Ollama',
	description: 'Configuration for Ollama',
	link: 'https://ollama.ai/library',
	config: z.object({
		model: z.string().default('llama2'),
		baseUrl: z.string().url(),
		numCtx: z.number().int().gte(1).default(2045),
		temperature: z.number().gte(0).lte(1).default(0.8),
		repeatPenalty: z.number().gte(-2).lte(2).default(1.1),
		repeatLastN: z.number().int().gte(1).default(64),
	}),
	model: ChatOllama,
})

const geminiChatLLMConfig = addChatModel({
	name: 'Gemini',
	description: 'Configuration for Google Gemini chat models',
	link: 'https://deepmind.google/technologies/gemini',
	config: z.object({
		apiKey: z.string(),
		model: z.string().default('gemini-pro'),
		temperature: z.number().gte(0).lte(1).default(0.1),
		topK: z.number().gte(1).int().default(1),
		topP: z.number().gte(0).lte(1).default(0.95),
		maxOutputTokens: z.number().int().gte(1).default(29000),
	}),
	model: ChatGoogleGenerativeAI,
})

const bedrockChatLLMConfig = addChatModel({
	name: 'Amazon Bedrock',
	description: 'Configuration for Amazon Bedrock chat models',
	link: 'https://aws.amazon.com/bedrock',
	config: z.object({
		model: z.string().default('amazon.titan-tg1-large'),
		region: z.string().default('us-west-2'),
		temperature: z.number().gte(0).lte(1).default(0.1),
		streaming: z.boolean().default(false),
		maxTokens: z.number().int().gte(1).default(4096),
		credentials: z.object({
			accessKeyId: z.string(),
			secretAccessKey: z.string(),
			sessionToken: z.string().optional(),
		}),
	}),
	model: BedrockChat,
})

export function getAllowedLLMs() {
	const allowedLLMs: ChatModelConfig<TODO>[] = [
		fakeLLMConfig,
		customLLMConfig,
		customOllamaLLMConfig,
		customOpenAILLMConfig,
		chatOpenAILLMConfig,
		azureChatOpenAILLMConfig,
		cohereLLMConfig,
		mistralAILLMConfig,
		anthropicLLMConfig,
		ollamaLLMConfig,
		geminiChatLLMConfig,
		bedrockChatLLMConfig,
	]
	const models = madHatter.executeHook('allowedLLMs', allowedLLMs, addChatModel)
	db.update((db) => {
		db.llms = models.map(m => ({
			name: m.info.id,
			value: db.llms.find(l => l.name === m.info.id)?.value || {},
		}))
	})
	return models as ChatModelConfig[]
}

export const getLLM = (llm: string) => getAllowedLLMs().find(e => e.info.id === llm)
