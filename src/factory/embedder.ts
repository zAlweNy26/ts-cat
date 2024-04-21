import { z } from 'zod'
import type { Embeddings } from '@langchain/core/embeddings'
import { TogetherAIEmbeddings } from '@langchain/community/embeddings/togetherai'
import { FireworksEmbeddings } from '@langchain/community/embeddings/fireworks'
import { FakeEmbeddings } from '@langchain/core/utils/testing'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { OpenAIEmbeddings } from '@langchain/openai'
import { CohereEmbeddings } from '@langchain/cohere'
import { ExecutionProvider as FastEmbedExecutionProviders, EmbeddingModel as FastEmbedModels } from 'fastembed'
import { madHatter } from '@mh'
import { db } from '@db'
import { CustomOpenAIEmbeddings, FastEmbedEmbeddings } from './custom_embedder.ts'

export interface EmbedderSettings<T extends z.AnyZodObject = z.AnyZodObject> {
	name: string
	humanReadableName: string
	description: string
	config: T
	link?: string
	getModel: (params: z.input<T>) => Embeddings
}

const fakeEmbedderConfig: EmbedderSettings = Object.freeze({
	name: 'FakeEmbedder',
	humanReadableName: 'Default Embedder',
	description: 'Fake embeddings for fallback',
	config: z.object({}),
	getModel: () => new FakeEmbeddings(),
})

const openAIEmbeddingModels = ['text-embedding-3-large', 'text-embedding-3-small', 'text-embedding-ada-002'] as const

const openAIEmbedderConfig: EmbedderSettings = Object.freeze({
	name: 'OpenAIEmbedder',
	humanReadableName: 'OpenAI Embedder',
	description: 'Configuration for OpenAI embeddings',
	link: 'https://platform.openai.com/docs/models/overview',
	config: z.object({
		apiKey: z.string(),
		model: z.enum(openAIEmbeddingModels).default('text-embedding-3-small'),
		dimensions: z.number().int().positive().default(1536),
	}),
	getModel(params: z.input<typeof openAIEmbedderConfig.config>) {
		const { apiKey, model, dimensions } = this.config.parse(params)
		return new OpenAIEmbeddings({ openAIApiKey: apiKey, modelName: model, dimensions })
	},
})

const azureOpenAIEmbedderConfig: EmbedderSettings = Object.freeze({
	name: 'AzureOpenAIEmbedder',
	humanReadableName: 'Azure OpenAI Embedder',
	description: 'Configuration for Azure OpenAI embeddings',
	link: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service',
	config: z.object({
		model: z.enum(openAIEmbeddingModels).default('text-embedding-ada-002'),
		version: z.string().default('2023-05-15'),
		apiKey: z.string(),
		base: z.string(),
		deployment: z.string(),
	}),
	getModel(params: z.input<typeof azureOpenAIEmbedderConfig.config>) {
		const { apiKey, model, base, version, deployment } = this.config.parse(params)
		return new OpenAIEmbeddings({
			modelName: model,
			azureOpenAIApiKey: apiKey,
			azureOpenAIBasePath: base,
			azureOpenAIApiVersion: version,
			azureOpenAIApiDeploymentName: deployment,
		})
	},
})

const togetherAIEmbedderConfig: EmbedderSettings = Object.freeze({
	name: 'TogetherAIEmbedder',
	humanReadableName: 'TogetherAI Embedder',
	description: 'Configuration for TogetherAI embeddings',
	link: 'https://docs.together.ai/docs/embedding-models',
	config: z.object({
		model: z.string().default('text-embedding-3-small'),
		apiKey: z.string(),
	}),
	getModel(params: z.input<typeof togetherAIEmbedderConfig.config>) {
		const { apiKey, model } = this.config.parse(params)
		return new TogetherAIEmbeddings({ apiKey, modelName: model })
	},
})

const fireworksEmbedderConfig: EmbedderSettings = Object.freeze({
	name: 'FireworksEmbedder',
	humanReadableName: 'Fireworks Embedder',
	description: 'Configuration for Fireworks embeddings',
	link: 'https://docs.together.ai/docs/embedding-models',
	config: z.object({
		model: z.string().default('nomic-ai/nomic-embed-text-v1.5'),
		apiKey: z.string(),
	}),
	getModel(params: z.input<typeof fireworksEmbedderConfig.config>) {
		const { apiKey, model } = this.config.parse(params)
		return new FireworksEmbeddings({ apiKey, modelName: model })
	},
})

const cohereEmbedderConfig: EmbedderSettings = Object.freeze({
	name: 'CohereEmbedder',
	humanReadableName: 'Cohere Embedder',
	description: 'Configuration for Cohere embeddings',
	link: 'https://docs.cohere.com/docs/models',
	config: z.object({
		apiKey: z.string(),
		model: z.string().default('embed-multilingual-v2.0'),
	}),
	getModel(params: z.input<typeof cohereEmbedderConfig.config>) {
		const { apiKey, model } = this.config.parse(params)
		return new CohereEmbeddings({ model, apiKey })
	},
})

const customOpenAIEmbedderConfig: EmbedderSettings = Object.freeze({
	name: 'CustomOpenAIEmbedder',
	humanReadableName: 'OpenAI-compatible API embedder',
	description: 'Configuration for self-hosted OpenAI-compatible API embeddings',
	config: z.object({
		url: z.string().url(),
	}),
	getModel(params: z.input<typeof customOpenAIEmbedderConfig.config>) {
		const { url } = this.config.parse(params)
		return new CustomOpenAIEmbeddings({ url })
	},
})

const qdrantFastEmbedSettings: EmbedderSettings = Object.freeze({
	name: 'QdrantFastEmbedEmbedder',
	humanReadableName: 'Qdrant FastEmbed (Local)',
	description: 'Configuration for Qdrant FastEmbed',
	link: 'https://qdrant.github.io/fastembed',
	config: z.object({
		model: z.nativeEnum(FastEmbedModels).default(FastEmbedModels.BGEBaseEN),
		maxLength: z.number().int().positive().default(512),
		docEmbedType: z.enum(['passage', 'default']).default('passage'),
		executionProviders: z.nativeEnum(FastEmbedExecutionProviders).array().default([FastEmbedExecutionProviders.CPU]),
		cacheDir: z.string().default('../data/models/fastembed_cache'),
	}),
	getModel(params: z.input<typeof qdrantFastEmbedSettings.config>) {
		const args = this.config.parse(params)
		return new FastEmbedEmbeddings(args)
	},
})

const googleEmbedderSettings: EmbedderSettings = Object.freeze({
	name: 'GoogleGeminiEmbedder',
	humanReadableName: 'Google Gemini Embedder',
	description: 'Configuration for Gemini Embedder',
	link: 'https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings',
	config: z.object({
		apiKey: z.string(),
		model: z.enum([
			'embedding-gecko-001',
			'embedding-gecko-002',
			'embedding-gecko-003',
			'embedding-gecko-multilingual-001',
		]).default('embedding-gecko-001'),
	}),
	getModel(params: z.input<typeof googleEmbedderSettings.config>) {
		const { model, apiKey } = this.config.parse(params)
		return new GoogleGenerativeAIEmbeddings({ apiKey, modelName: model })
	},
})

export function getAllowedEmbedders() {
	const allowedEmbeddersModels: EmbedderSettings[] = [
		fakeEmbedderConfig,
		openAIEmbedderConfig,
		azureOpenAIEmbedderConfig,
		fireworksEmbedderConfig,
		togetherAIEmbedderConfig,
		cohereEmbedderConfig,
		customOpenAIEmbedderConfig,
		qdrantFastEmbedSettings,
		googleEmbedderSettings,
	]
	const models = madHatter.executeHook('allowedEmbedders', allowedEmbeddersModels)
	db.update((db) => {
		db.embedders = models.map(m => ({
			name: m.name,
			value: db.embedders.find(l => l.name === m.name)?.value || {},
		}))
	})
	return models
}

export const getEmbedder = (embedder: string) => getAllowedEmbedders().find(e => e.name === embedder)
