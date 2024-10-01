import type { EmbeddingsParams } from '@langchain/core/embeddings'
import { join } from 'node:path'
import { Embeddings } from '@langchain/core/embeddings'
import { FlagEmbedding } from 'fastembed'
import { ofetch } from 'ofetch'

/**
 * Use LLAMA2 as embedder by calling a self-hosted lama-cpp-python instance.
 */
export class CustomOpenAIEmbeddings extends Embeddings {
	private url = ''

	constructor(params: EmbeddingsParams & { baseUrl: string }) {
		const { baseUrl, ...args } = params
		super(args)
		this.url = join(baseUrl, 'v1/embeddings')
	}

	async embedDocuments(documents: string[]): Promise<number[][]> {
		const payload = JSON.stringify({ input: documents })
		const res = await ofetch<{ data: { embedding: number[] }[] }>(this.url, {
			method: 'POST',
			body: payload,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		})
		return res.data.map(x => x.embedding)
	}

	async embedQuery(document: string): Promise<number[]> {
		const payload = JSON.stringify({ input: document })
		const res = await ofetch<{ data: { embedding: number[] }[] }>(this.url, {
			method: 'POST',
			body: payload,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		})
		return res.data[0]!.embedding
	}
}

type FastEmbeddingsParams = EmbeddingsParams & Parameters<typeof FlagEmbedding.init>[0] & { docEmbedType: 'passage' | 'default' }

/**
 * Use Fastembed as embedder.
 */
export class FastEmbedEmbeddings extends Embeddings {
	private embedder: Promise<FlagEmbedding>

	constructor(private params: FastEmbeddingsParams) {
		super(params)
		this.embedder = FlagEmbedding.init({
			...params,
			showDownloadProgress: false,
		})
	}

	async embedDocuments(documents: string[]): Promise<number[][]> {
		const embedder = await this.embedder
		const results: number[][][] = []
		const docsEmbed = this.params.docEmbedType === 'passage' ? embedder.passageEmbed : embedder.embed
		for await (const value of docsEmbed(documents)) results.push(value)
		return results.flat()
	}

	async embedQuery(document: string): Promise<number[]> {
		const embedder = await this.embedder
		return embedder.queryEmbed(document)
	}
}
