import type { Embeddings } from '@langchain/core/embeddings'
import { db } from '@db'
import { BedrockEmbeddings } from '@langchain/aws'
import { CohereEmbeddings } from '@langchain/cohere'
import { FireworksEmbeddings } from '@langchain/community/embeddings/fireworks'
import { JinaEmbeddings } from '@langchain/community/embeddings/jina'
import { TogetherAIEmbeddings } from '@langchain/community/embeddings/togetherai'
import { FakeEmbeddings } from '@langchain/core/utils/testing'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { AzureOpenAIEmbeddings, OpenAIEmbeddings } from '@langchain/openai'
import { embedderCache } from '@lg/cache.ts'
import { madHatter } from '@mh'
import { ExecutionProvider as FastEmbedExecutionProviders, EmbeddingModel as FastEmbedModels } from 'fastembed'
import { CacheBackedEmbeddings } from 'langchain/embeddings/cache_backed'
import { z, ZodIssueCode } from 'zod'
import { CustomOpenAIEmbeddings, FastEmbedEmbeddings } from './custom_embedder.ts'

interface EmbedderSettings<Config extends z.ZodTypeAny> {
	name: string
	description: string
	link?: string
	config: Config
	model: new (params: z.output<Config>) => Embeddings
}

export class EmbedderConfig<Config extends z.ZodTypeAny = z.ZodTypeAny> {
	constructor(private _settings: EmbedderSettings<Config>) {}

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
		const embedder = new Model(config.parse(params))
		const cache = embedderCache()
		if (cache) return CacheBackedEmbeddings.fromBytesStore(embedder, cache, { namespace: model.name })
		return embedder
	}
}

export function addEmbeddings<Config extends z.ZodTypeAny>(settings: EmbedderSettings<Config>) {
	return new EmbedderConfig<Config>(settings)
}

const fakeEmbedderConfig = addEmbeddings({
	name: 'Default Embedder',
	description: 'Fake embeddings as fallback when no embedder is configured',
	config: z.object({}),
	model: FakeEmbeddings,
})

const customOpenAIEmbedderConfig = addEmbeddings({
	name: 'Custom OpenAI-compatible API',
	description: 'Configuration for self-hosted OpenAI-compatible API embeddings',
	config: z.object({
		baseUrl: z.string().url(),
	}),
	model: CustomOpenAIEmbeddings,
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

const openAIEmbedderConfig = addEmbeddings({
	name: 'OpenAI',
	description: 'Configuration for OpenAI embeddings',
	link: 'https://platform.openai.com/docs/models/overview',
	config: z.object({
		apiKey: z.string(),
		model: z.enum(openAIEmbeddingModels).default('text-embedding-3-small'),
		dimensions: z.number().int().positive().max(3072).optional(),
	}).superRefine((data, ctx) => openAIEmbeddingModelsValidation(data.dimensions, data.model, ctx)),
	model: OpenAIEmbeddings,
})

const azureOpenAIEmbedderConfig = addEmbeddings({
	name: 'Azure OpenAI',
	description: 'Configuration for Azure OpenAI embeddings',
	link: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service',
	config: z.object({
		model: z.enum(openAIEmbeddingModels).default('text-embedding-3-small'),
		version: z.string().default('2023-05-15'),
		apiKey: z.string(),
		base: z.string(),
		deployment: z.string(),
		dimensions: z.number().int().positive().max(3072).optional(),
	}).superRefine((data, ctx) => openAIEmbeddingModelsValidation(data.dimensions, data.model, ctx)),
	model: AzureOpenAIEmbeddings,
})

const togetherAIEmbedderConfig = addEmbeddings({
	name: 'TogetherAI',
	description: 'Configuration for TogetherAI embeddings',
	link: 'https://docs.together.ai/docs/embedding-models',
	config: z.object({
		model: z.string().default('togethercomputer/m2-bert-80M-8k-retrieval'),
		apiKey: z.string(),
	}),
	model: TogetherAIEmbeddings,
})

const fireworksEmbedderConfig = addEmbeddings({
	name: 'Fireworks',
	description: 'Configuration for Fireworks embeddings',
	link: 'https://docs.together.ai/docs/embedding-models',
	config: z.object({
		model: z.string().default('nomic-ai/nomic-embed-text-v1.5'),
		apiKey: z.string(),
	}),
	model: FireworksEmbeddings,
})

const cohereEmbedderConfig = addEmbeddings({
	name: 'Cohere',
	description: 'Configuration for Cohere embeddings',
	link: 'https://docs.cohere.com/docs/models',
	config: z.object({
		apiKey: z.string(),
		model: z.string().default('embed-multilingual-v2.0'),
	}),
	model: CohereEmbeddings,
})

const jinaEmbedderConfig = addEmbeddings({
	name: 'Jina',
	description: 'Configuration for Jina embeddings',
	link: 'https://jina.ai/embeddings/',
	config: z.object({
		apiKey: z.string(),
		model: z.string().default('jina-clip-v1'),
	}),
	model: JinaEmbeddings,
})

const qdrantFastEmbedSettings = addEmbeddings({
	name: 'Qdrant FastEmbed (Local)',
	description: 'Configuration for Qdrant FastEmbed',
	link: 'https://qdrant.github.io/fastembed',
	config: z.object({
		model: z.nativeEnum(FastEmbedModels).default(FastEmbedModels.BGEBaseEN),
		maxLength: z.number().int().positive().default(512),
		docEmbedType: z.enum(['passage', 'default']).default('passage'),
		executionProviders: z.nativeEnum(FastEmbedExecutionProviders).array().default([FastEmbedExecutionProviders.CPU]),
		cacheDir: z.string().default('../data/models/fastembed_cache'),
	}),
	model: FastEmbedEmbeddings,
})

const googleEmbeddingModels = ['embedding-gecko-001', 'embedding-gecko-002', 'embedding-gecko-003', 'embedding-gecko-multilingual-001'] as const

const googleEmbedderSettings = addEmbeddings({
	name: 'Google Gemini',
	description: 'Configuration for Gemini Embedder',
	link: 'https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings',
	config: z.object({
		apiKey: z.string(),
		model: z.enum(googleEmbeddingModels).default('embedding-gecko-001'),
	}),
	model: GoogleGenerativeAIEmbeddings,
})

const bedrockEmbedderConfig = addEmbeddings({
	name: 'Amazon Bedrock',
	description: 'Configuration for Amazon Bedrock Embeddings',
	link: 'https://aws.amazon.com/bedrock',
	config: z.object({
		model: z.string().default('amazon.titan-embed-text-v1'),
		region: z.string().default('us-west-2'),
		credentials: z.object({
			accessKeyId: z.string(),
			secretAccessKey: z.string(),
			sessionToken: z.string().optional(),
		}),
	}),
	model: BedrockEmbeddings,
})

export async function getAllowedEmbedders() {
	const allowedEmbeddersModels: EmbedderConfig<any>[] = [
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
		bedrockEmbedderConfig,
	]
	const models = await madHatter.executeHook('allowedEmbedders', allowedEmbeddersModels, addEmbeddings)
	db.update((db) => {
		db.embedders = models.map(m => ({
			name: m.info.id,
			value: db.embedders.find(l => l.name === m.info.id)?.value || {},
		}))
	})
	return models as EmbedderConfig[]
}

export const getEmbedder = async (embedder: string) => (await getAllowedEmbedders()).find(e => e.info.id === embedder)

export function getEmbedderSettings(emb?: string) {
	emb ||= db.data.selectedEmbedder
	return db.data.embedders.find(e => e.name === emb)?.value
}
