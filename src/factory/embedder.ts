import type { Embeddings } from '@langchain/core/embeddings'
import { db } from '@db'
import { CohereEmbeddings } from '@langchain/cohere'
import { FireworksEmbeddings } from '@langchain/community/embeddings/fireworks'
import { JinaEmbeddings } from '@langchain/community/embeddings/jina'
import { TogetherAIEmbeddings } from '@langchain/community/embeddings/togetherai'
import { FakeEmbeddings } from '@langchain/core/utils/testing'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { OpenAIEmbeddings } from '@langchain/openai'
import { madHatter } from '@mh'
import { ExecutionProvider as FastEmbedExecutionProviders, EmbeddingModel as FastEmbedModels } from 'fastembed'
import { z, ZodIssueCode } from 'zod'
import { CustomOpenAIEmbeddings, FastEmbedEmbeddings } from './custom_embedder.ts'

export interface EmbedderSettings {
	name: string
	humanReadableName: string
	description: string
	link?: string
	config: z.ZodEffects<z.AnyZodObject> | z.AnyZodObject
	getModel: (params: z.input<this['config']>) => Embeddings
}

const fakeEmbedderConfig: Readonly<EmbedderSettings> = Object.freeze({
	name: 'FakeEmbedder',
	humanReadableName: 'Default Embedder',
	description: 'Fake embeddings for fallback',
	config: z.object({}),
	getModel: () => new FakeEmbeddings(),
})

const openAIEmbeddingModels = ['text-embedding-3-large', 'text-embedding-3-small', 'text-embedding-ada-002'] as const

function openAIEmbeddingModelsValidation(dimensions: number | undefined, model: typeof openAIEmbeddingModels[number], ctx: z.RefinementCtx) {
	if (dimensions && model === 'text-embedding-ada-002') {
		ctx.addIssue({
			code: ZodIssueCode.invalid_type,
			expected: 'undefined',
			received: 'number',
			message: 'Dimensions are not allowed for this model',
			path: ['dimensions'],
		})
	}
	else if (dimensions) {
		if (dimensions > 3072 && model === 'text-embedding-3-large') {
			ctx.addIssue({
				code: ZodIssueCode.too_big,
				maximum: 3072,
				type: 'number',
				inclusive: true,
				message: 'Dimensions must be less than or equal to 3072',
				path: ['dimensions'],
			})
		}
		else if (dimensions > 1536 && model === 'text-embedding-3-small') {
			ctx.addIssue({
				code: ZodIssueCode.too_big,
				maximum: 1536,
				type: 'number',
				inclusive: true,
				message: 'Dimensions must be less than or equal to 1536',
				path: ['dimensions'],
			})
		}
	}
}

const openAIEmbedderConfig: Readonly<EmbedderSettings> = Object.freeze({
	name: 'OpenAIEmbedder',
	humanReadableName: 'OpenAI Embedder',
	description: 'Configuration for OpenAI embeddings',
	link: 'https://platform.openai.com/docs/models/overview',
	config: z.object({
		apiKey: z.string(),
		model: z.enum(openAIEmbeddingModels).default('text-embedding-3-small'),
		dimensions: z.number().int().positive().max(3072).optional(),
	}).superRefine((data, ctx) => openAIEmbeddingModelsValidation(data.dimensions, data.model, ctx)),
	getModel(params: z.input<typeof openAIEmbedderConfig.config>) {
		const { apiKey, model, dimensions } = this.config.parse(params)
		return new OpenAIEmbeddings({ openAIApiKey: apiKey, model, dimensions })
	},
})

const azureOpenAIEmbedderConfig: Readonly<EmbedderSettings> = Object.freeze({
	name: 'AzureOpenAIEmbedder',
	humanReadableName: 'Azure OpenAI Embedder',
	description: 'Configuration for Azure OpenAI embeddings',
	link: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service',
	config: z.object({
		model: z.enum(openAIEmbeddingModels).default('text-embedding-3-small'),
		version: z.string().default('2023-05-15'),
		apiKey: z.string(),
		base: z.string(),
		deployment: z.string(),
		dimensions: z.number().int().positive().optional(),
	}).superRefine((data, ctx) => openAIEmbeddingModelsValidation(data.dimensions, data.model, ctx)),
	getModel(params: z.input<typeof azureOpenAIEmbedderConfig.config>) {
		const { apiKey, model, base, version, deployment, dimensions } = this.config.parse(params)
		return new OpenAIEmbeddings({
			azureOpenAIApiKey: apiKey,
			azureOpenAIBasePath: base,
			azureOpenAIApiVersion: version,
			azureOpenAIApiDeploymentName: deployment,
			dimensions,
			model,
		})
	},
})

const togetherAIEmbedderConfig: Readonly<EmbedderSettings> = Object.freeze({
	name: 'TogetherAIEmbedder',
	humanReadableName: 'TogetherAI Embedder',
	description: 'Configuration for TogetherAI embeddings',
	link: 'https://docs.together.ai/docs/embedding-models',
	config: z.object({
		model: z.string().default('togethercomputer/m2-bert-80M-8k-retrieval'),
		apiKey: z.string(),
	}),
	getModel(params: z.input<typeof togetherAIEmbedderConfig.config>) {
		const { apiKey, model } = this.config.parse(params)
		return new TogetherAIEmbeddings({ apiKey, model })
	},
})

const fireworksEmbedderConfig: Readonly<EmbedderSettings> = Object.freeze({
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

const cohereEmbedderConfig: Readonly<EmbedderSettings> = Object.freeze({
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

const jinaEmbedderConfig: Readonly<EmbedderSettings> = Object.freeze({
	name: 'JinaEmbedder',
	humanReadableName: 'Jina Embedder',
	description: 'Configuration for Jina embeddings',
	link: 'https://jina.ai/embeddings/',
	config: z.object({
		apiKey: z.string(),
		model: z.string().default('jina-clip-v1'),
	}),
	getModel(params: z.input<typeof cohereEmbedderConfig.config>) {
		const { apiKey, model } = this.config.parse(params)
		return new JinaEmbeddings({ model, apiKey })
	},
})

const customOpenAIEmbedderConfig: Readonly<EmbedderSettings> = Object.freeze({
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

const qdrantFastEmbedSettings: Readonly<EmbedderSettings> = Object.freeze({
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

const googleEmbeddingModels = ['embedding-gecko-001', 'embedding-gecko-002', 'embedding-gecko-003', 'embedding-gecko-multilingual-001'] as const

const googleEmbedderSettings: Readonly<EmbedderSettings> = Object.freeze({
	name: 'GoogleGeminiEmbedder',
	humanReadableName: 'Google Gemini Embedder',
	description: 'Configuration for Gemini Embedder',
	link: 'https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings',
	config: z.object({
		apiKey: z.string(),
		model: z.enum(googleEmbeddingModels).default('embedding-gecko-001'),
	}),
	getModel(params: z.input<typeof googleEmbedderSettings.config>) {
		const { model, apiKey } = this.config.parse(params)
		return new GoogleGenerativeAIEmbeddings({ apiKey, model })
	},
})

export function getAllowedEmbedders() {
	const allowedEmbeddersModels: EmbedderSettings[] = [
		fakeEmbedderConfig,
		openAIEmbedderConfig,
		azureOpenAIEmbedderConfig,
		fireworksEmbedderConfig,
		togetherAIEmbedderConfig,
		jinaEmbedderConfig,
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
