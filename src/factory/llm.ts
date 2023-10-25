import { z } from 'zod'
import { HuggingFaceInference } from '@langchain/community/llms/hf'
import { Ollama } from '@langchain/community/llms/ollama'
import { AzureChatOpenAI, AzureOpenAI, ChatOpenAI, OpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { Cohere } from '@langchain/cohere'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import type { BaseLanguageModel } from '@langchain/core/language_models/base'
import { madHatter } from '../mad_hatter/index.ts'
import type { ZodGenericObject } from '../utils.ts'
import { zodJsonType } from '../utils.ts'
import { updateDb } from '../database.ts'
import { CustomLLM, CustomOpenAILLM, DefaultLLM } from './custom_llm.ts'

export interface LLMSettings<T extends ZodGenericObject = ZodGenericObject> {
	name: string
	humanReadableName: string
	description: string
	config: T
	link?: string
	getModel: (params: z.input<T>) => BaseLanguageModel
}

const defaultLLMConfig: Readonly<LLMSettings> = Object.freeze({
	name: 'DefaultLLM',
	humanReadableName: 'Default Language Model',
	description: 'A dumb LLM just telling that the Cat is not configured. There will be a nice LLM here once consumer hardware allows it.',
	config: z.object({}),
	getModel: (params: z.input<typeof defaultLLMConfig.config>) => new DefaultLLM(params),
})

const customLLMConfig: Readonly<LLMSettings> = Object.freeze({
	name: 'CustomLLM',
	humanReadableName: 'Custom Language Model',
	description: 'Configuration for custom language model',
	config: z.object({
		authKey: z.string().optional(),
		options: zodJsonType,
	}),
	getModel: (params: z.input<typeof customLLMConfig.config>) => new CustomLLM(params),
})

const customOpenAILLMConfig: Readonly<LLMSettings> = Object.freeze({
	name: 'CustomOpenAILLM',
	humanReadableName: 'OpenAI-compatible API',
	description: 'Configuration for self-hosted OpenAI-compatible API server, e.g. llama-cpp-python server, text-generation-webui, OpenRouter, TinyLLM',
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
		return new ChatOpenAI({ openAIApiKey: apiKey, modelName: model, temperature, streaming })
	},
})

const openAILLMConfig: Readonly<LLMSettings> = Object.freeze({
	name: 'OpenAILLM',
	humanReadableName: 'OpenAI GPT',
	description: 'More expensive but also more flexible model than ChatGPT',
	link: 'https://platform.openai.com/docs/models/overview',
	config: z.object({
		apiKey: z.string(),
		model: z.string().default('gpt-3.5-turbo-instruct'),
		temperature: z.number().gte(0).lte(1).default(0.7),
		streaming: z.boolean().default(false),
	}),
	getModel(params: z.input<typeof openAILLMConfig.config>) {
		const { apiKey, model, temperature, streaming } = this.config.parse(params)
		return new OpenAI({ openAIApiKey: apiKey, modelName: model, temperature, streaming })
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
			modelName: model,
			streaming,
			azureOpenAIBasePath: base,
			azureOpenAIApiKey: apiKey,
			azureOpenAIApiDeploymentName: deployment,
			azureOpenAIApiVersion: version,
			maxTokens,
		})
	},
})

const azureOpenAILLMConfig: Readonly<LLMSettings> = Object.freeze({
	name: 'AzureOpenAILLM',
	humanReadableName: 'Azure OpenAI Completion model',
	description: 'Configuration for Cognitive Services Azure OpenAI',
	link: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service',
	config: z.object({
		apiKey: z.string(),
		base: z.string(),
		deployment: z.string(),
		model: z.string().default('gpt-35-turbo-instruct'),
		maxTokens: z.number().int().gte(1).default(2048),
		version: z.string().default('2023-05-15'),
		streaming: z.boolean().default(false),
	}),
	getModel(params: z.input<typeof azureOpenAILLMConfig.config>) {
		const { apiKey, model, streaming, base, deployment, version, maxTokens } = this.config.parse(params)
		return new AzureOpenAI({
			modelName: model,
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
		return new Cohere({ model, apiKey, temperature })
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
		return new ChatAnthropic({
			anthropicApiKey: apiKey,
			modelName: model,
			maxTokens,
			streaming,
			temperature,
		})
	},
})

const hfTextGenInferenceLLMConfig: Readonly<LLMSettings> = Object.freeze({
	name: 'HuggingFaceTextGenInferenceLLM',
	humanReadableName: 'Hugging Face Text Generation Inference',
	description: 'Configuration for Hugging Face Text Generation Inference',
	link: 'https://huggingface.co/text-generation-inference',
	config: z.object({
		apiKey: z.string(),
		serverUrl: z.string().url(),
		maxTokens: z.number().int().gte(1).default(512),
		topK: z.number().int().gte(1).default(10),
		topP: z.number().gte(0).lte(1).default(0.95),
		temperature: z.number().gte(0).lte(1).default(0.1),
		repeatPenalty: z.number().gte(-2).lte(2).default(1.05),
	}),
	getModel(params: z.input<typeof hfTextGenInferenceLLMConfig.config>) {
		const { apiKey, serverUrl, maxTokens, repeatPenalty, temperature, topK, topP } = this.config.parse(params)
		return new HuggingFaceInference({
			apiKey,
			endpointUrl: serverUrl,
			maxTokens,
			frequencyPenalty: repeatPenalty,
			temperature,
			topK,
			topP,
		})
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
		return new Ollama({
			baseUrl,
			model,
			numCtx,
			repeatLastN,
			repeatPenalty,
			temperature,
		})
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
		return new ChatGoogleGenerativeAI({
			apiKey,
			maxOutputTokens,
			modelName: model,
			temperature,
			topK,
			topP,
		})
	},
})

export function getAllowedLLMs() {
	const allowedLLMsModels = [
		defaultLLMConfig,
		customLLMConfig,
		customOpenAILLMConfig,
		chatOpenAILLMConfig,
		openAILLMConfig,
		azureChatOpenAILLMConfig,
		azureOpenAILLMConfig,
		cohereLLMConfig,
		hfTextGenInferenceLLMConfig,
		ollamaLLMConfig,
		geminiChatLLMConfig,
		anthropicLLMConfig,
	]
	const models = madHatter.executeHook('allowedLLMs', allowedLLMsModels)
	updateDb((db) => {
		db.llms = models.map(m => ({
			name: m.name,
			value: db.llms.find(l => l.name === m.name)?.value || {},
		}))
	})
	return models
}

export const getLLM = (llm: string) => getAllowedLLMs().find(e => e.name === llm)
