import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { db } from '@db'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatCohere } from '@langchain/cohere'
import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatMistralAI } from '@langchain/mistralai'
import { AzureChatOpenAI, ChatOpenAI } from '@langchain/openai'
import { madHatter } from '@mh'
import { z } from 'zod'
import { CustomOpenAILLM, DefaultLLM } from './custom_llm.ts'

export interface LLMSettings {
	name: string
	humanReadableName: string
	description: string
	link?: string
	config: z.ZodEffects<z.AnyZodObject> | z.AnyZodObject
	getModel: (params: z.input<this['config']>) => BaseChatModel
}

const defaultLLMConfig: Readonly<LLMSettings> = Object.freeze({
	name: 'DefaultLLM',
	humanReadableName: 'Default Language Model',
	description: 'A dumb LLM just telling that the Cat is not configured. There will be a nice LLM here once consumer hardware allows it.',
	config: z.object({}),
	getModel: () => new DefaultLLM(),
})

const customOpenAILLMConfig: Readonly<LLMSettings> = Object.freeze({
	name: 'CustomOpenAILLM',
	humanReadableName: 'OpenAI-compatible API',
	description: 'Configuration for self-hosted OpenAI-compatible API server, e.g. llama-cpp-python server, text-generation-webui, OpenRouter, TinyLLM, etc...',
	config: z.object({
		url: z.string().url(),
		temperature: z.number().gte(0).lte(1).default(0.1),
		maxTokens: z.number().int().gte(1).default(512),
		stop: z.string().default('Human:,###'),
		topK: z.number().int().gte(1).default(40),
		topP: z.number().gte(0).lte(1).default(0.95),
		repeatPenalty: z.number().gte(-2).lte(2).default(1.1),
	}),
	getModel(params: z.input<typeof customOpenAILLMConfig.config>) {
		const { stop, url, temperature, maxTokens, topK, topP, repeatPenalty } = this.config.parse(params)
		return new CustomOpenAILLM({
			stop: stop.split(','),
			frequencyPenalty: repeatPenalty,
			topP,
			maxTokens,
			temperature,
			modelKwargs: { topK, url },
		})
	},
})

const chatOpenAILLMConfig: Readonly<LLMSettings> = Object.freeze({
	name: 'ChatOpenAILLM',
	humanReadableName: 'OpenAI ChatGPT',
	description: 'Chat model from OpenAI',
	link: 'https://platform.openai.com/docs/models/overview',
	config: z.object({
		apiKey: z.string(),
		model: z.string().default('gpt-3.5-turbo'),
		temperature: z.number().gte(0).lte(1).default(0.7),
		streaming: z.boolean().default(false),
	}),
	getModel(params: z.input<typeof chatOpenAILLMConfig.config>) {
		const { apiKey, model, temperature, streaming } = this.config.parse(params)
		return new ChatOpenAI({ apiKey, model, temperature, streaming })
	},
})

const azureChatOpenAILLMConfig: Readonly<LLMSettings> = Object.freeze({
	name: 'AzureChatOpenAILLM',
	humanReadableName: 'Azure OpenAI Chat model',
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
	getModel(params: z.input<typeof azureChatOpenAILLMConfig.config>) {
		const { apiKey, model, streaming, base, deployment, version, maxTokens } = this.config.parse(params)
		return new AzureChatOpenAI({
			model,
			streaming,
			azureOpenAIBasePath: base,
			azureOpenAIApiKey: apiKey,
			azureOpenAIApiDeploymentName: deployment,
			azureOpenAIApiVersion: version,
			maxTokens,
		})
	},
})

const cohereLLMConfig: Readonly<LLMSettings> = Object.freeze({
	name: 'CohereLLM',
	humanReadableName: 'Cohere',
	description: 'Configuration for Cohere language model',
	link: 'https://docs.cohere.com/docs/models',
	config: z.object({
		apiKey: z.string(),
		model: z.string().default('command'),
		temperature: z.number().gte(0).lte(1).default(0.7),
	}),
	getModel(params: z.input<typeof cohereLLMConfig.config>) {
		const { apiKey, model, temperature } = this.config.parse(params)
		return new ChatCohere({ model, apiKey, temperature })
	},
})

const mistralAILLMConfig: Readonly<LLMSettings> = Object.freeze({
	name: 'MistralAILLM',
	humanReadableName: 'MistralAI',
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
	getModel(params: z.input<typeof mistralAILLMConfig.config>) {
		const { apiKey, model, maxTokens, topP, streaming, temperature } = this.config.parse(params)
		return new ChatMistralAI({ apiKey, model, maxTokens, topP, streaming, temperature })
	},
})

const anthropicLLMConfig: Readonly<LLMSettings> = Object.freeze({
	name: 'AnthropicLLM',
	humanReadableName: 'Anthropic',
	description: 'Configuration for Anthropic Claude model',
	link: 'https://www.anthropic.com/claude',
	config: z.object({
		apiKey: z.string(),
		model: z.string().default('claude-3-opus-20240229'),
		maxTokens: z.number().int().gte(1).default(4096),
		temperature: z.number().gte(0).lte(1).default(0.7),
		streaming: z.boolean().default(false),
	}),
	getModel(params: z.input<typeof anthropicLLMConfig.config>) {
		const { apiKey, model, maxTokens, streaming, temperature } = this.config.parse(params)
		return new ChatAnthropic({ apiKey, model, maxTokens, streaming, temperature })
	},
})

const ollamaLLMConfig: Readonly<LLMSettings> = Object.freeze({
	name: 'OllamaLLM',
	humanReadableName: 'Ollama',
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
	getModel(params: z.input<typeof ollamaLLMConfig.config>) {
		const { baseUrl, model, numCtx, repeatLastN, repeatPenalty, temperature } = this.config.parse(params)
		return new ChatOllama({ baseUrl, model, numCtx, repeatLastN, repeatPenalty, temperature })
	},
})

const geminiChatLLMConfig: Readonly<LLMSettings> = Object.freeze({
	name: 'GeminiChatLLM',
	humanReadableName: 'Google Gemini Chat',
	description: 'Configuration for Google Gemini Chat',
	link: 'https://deepmind.google/technologies/gemini',
	config: z.object({
		apiKey: z.string(),
		model: z.string().default('gemini-pro'),
		temperature: z.number().gte(0).lte(1).default(0.1),
		topK: z.number().gte(1).int().default(1),
		topP: z.number().gte(0).lte(1).default(0.95),
		maxOutputTokens: z.number().int().gte(1).default(29000),
	}),
	getModel(params: z.input<typeof geminiChatLLMConfig.config>) {
		const { apiKey, maxOutputTokens, model, temperature, topK, topP } = this.config.parse(params)
		return new ChatGoogleGenerativeAI({ apiKey, maxOutputTokens, model, temperature, topK, topP })
	},
})

export function getAllowedLLMs() {
	const allowedLLMsModels = [
		defaultLLMConfig,
		customOpenAILLMConfig,
		chatOpenAILLMConfig,
		azureChatOpenAILLMConfig,
		mistralAILLMConfig,
		cohereLLMConfig,
		ollamaLLMConfig,
		geminiChatLLMConfig,
		anthropicLLMConfig,
	]
	const models = madHatter.executeHook('allowedLLMs', allowedLLMsModels)
	db.update((db) => {
		db.llms = models.map(m => ({
			name: m.name,
			value: db.llms.find(l => l.name === m.name)?.value || {},
		}))
	})
	return models
}

export const getLLM = (llm: string) => getAllowedLLMs().find(e => e.name === llm)
