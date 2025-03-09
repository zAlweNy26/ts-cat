import type { EmbeddingsParams } from '@langchain/core/embeddings'
import { join } from 'node:path'
import { Embeddings } from '@langchain/core/embeddings'
import { FlagEmbedding } from 'fastembed'
import { ofetch } from 'ofetch'

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

export class FastEmbedEmbeddings extends Embeddings {
	private embedder!: FlagEmbedding

	constructor(private params: FastEmbeddingsParams) {
		super(params)
		this.init()
	}

	private async init() {
		this.embedder = await FlagEmbedding.init({
			...this.params,
			showDownloadProgress: false,
		})
	}

	// Javascript moment: Float32array !== number[]
	async embedDocuments(documents: string[]): Promise<number[][]> {
		if (!this.embedder) await this.init()
		const results: number[][][] = []
		for await (const value of this.embedder.passageEmbed(documents))
			results.push(value.map(s => Array.from(s)))
		return results.flat()
	}

	async embedQuery(document: string): Promise<number[]> {
		if (!this.embedder) await this.init()
		return Array.from(await this.embedder.queryEmbed(document))
	}
}
