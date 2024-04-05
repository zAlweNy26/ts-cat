import { basename, extname, resolve } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { CSVLoader } from 'langchain/document_loaders/fs/csv'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { DocxLoader } from 'langchain/document_loaders/fs/docx'
import { JSONLoader } from 'langchain/document_loaders/fs/json'
import { PPTXLoader } from 'langchain/document_loaders/fs/pptx'
import type { BaseDocumentLoader } from 'langchain/document_loaders/base'
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio'
import { getEncoding } from 'js-tiktoken'
import type { TextSplitter } from 'langchain/text_splitter'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import type { Document } from '@langchain/core/documents'
import { destr } from 'destr'
import type { StrayCat } from '@lg/stray-cat.ts'
import { cheshireCat } from '@lg/cheshire-cat.ts'
import { madHatter } from '@mh/mad-hatter.ts'
import type { PointData } from '@memory/vector-memory-collection.ts'
import { log } from '@logger'
import { getDb } from './database.ts'
import { sleep } from './utils.ts'

export interface MemoryJson {
	embedder: string
	collections: {
		declarative: PointData[]
		procedural: PointData[]
		episodic: PointData[]
		[key: string]: PointData[]
	}
}

export type WebParser = [RegExp, new (content: string) => BaseDocumentLoader]

export type FileParsers = Record<`${string}/${string}`, new (content: string | Blob) => BaseDocumentLoader>

export class RabbitHole {
	private static instance: RabbitHole
	private splitter: TextSplitter
	private webHandlers: WebParser[] = [
		[/^(https?:\/\/)?(www\.)?.*\..*$/g, CheerioWebBaseLoader],
	]

	private fileHandlers: FileParsers = {
		'text/csv': CSVLoader,
		'text/plain': TextLoader,
		'text/markdown': TextLoader,
		'application/pdf': PDFLoader,
		'application/json': JSONLoader,
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': CSVLoader,
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document': DocxLoader,
		'application/vnd.openxmlformats-officedocument.presentationml.presentation': PPTXLoader,
	}

	private constructor() {
		this.fileHandlers = {
			...this.fileHandlers,
			...madHatter.executeHook('fileParsers', {}),
		}
		this.webHandlers = [...this.webHandlers, ...madHatter.executeHook('webParsers', [])]
		this.splitter = new RecursiveCharacterTextSplitter({
			separators: ['\\n\\n', '\n\n', '.\\n', '.\n', '\\n', '\n', ' ', ''],
			keepSeparator: true,
			lengthFunction: text => getEncoding('cl100k_base').encode(text).length,
		})
		this.splitter = madHatter.executeHook('textSplitter', this.splitter)
	}

	/**
	 * Get the Rabbit Hole instance
	 * @returns The Rabbit Hole class as a singleton
	 */
	static getInstance() {
		if (!RabbitHole.instance) {
			log.silent('Initializing the Rabbit Hole...')
			RabbitHole.instance = new RabbitHole()
		}
		return RabbitHole.instance
	}

	get fileParsers() {
		return this.fileHandlers
	}

	get webParsers() {
		return this.webHandlers
	}

	/**
	 * Upload memories to the declarative memory from a JSON file.
	 * When doing this, please, make sure the embedder used to export the memories is the same as the one used when uploading.
	 * The method also performs a check on the dimensionality of the embeddings (i.e. length of each vector).
	 * @param json the json object containing the memories to be ingested.
	 */
	async ingestMemory(json: File | MemoryJson) {
		log.info('Ingesting memory...')
		let content: MemoryJson

		if (json instanceof File) {
			if (json.type !== 'application/json') {
				log.error('The file is not a JSON file. Skipping ingestion...')
				throw new Error('The file is not a valid JSON file.')
			}
			content = destr(await json.text())
		}
		else content = json

		if (!content.embedder || content.embedder !== getDb().selectedEmbedder) {
			log.error('The embedder used to export the memories is different from the one currently used.')
			return
		}

		const declarativeMemories = content.collections.declarative
		const vectors = declarativeMemories.map(m => m.vector)

		log.info(`Preparing to load ${vectors.length} vector memories...`)

		if (vectors.some(v => v.length !== cheshireCat.embedderSize)) {
			log.error('The dimensionality of the embeddings is not consistent with the current embedder.')
			return
		}

		await cheshireCat.currentMemory.collections.declarative.addPoints(declarativeMemories)
	}

	async ingestContent(stray: StrayCat, content: string | string[]) {
		log.info('Ingesting textual content...')
		const docs = await this.splitTexts(stray, Array.isArray(content) ? content : [content], content.length, 0)
		await this.storeDocuments(stray, docs, 'textual content')
	}

	async ingestFile(stray: StrayCat, file: File, chunkSize = 512, chunkOverlap = 128) {
		const mime = file.type as keyof typeof this.fileHandlers
		if (!Object.keys(this.fileHandlers).includes(mime)) { throw new Error('The file type is not supported. Skipping ingestion...') }
		log.info('Ingesting file...')
		const loader = new this.fileHandlers[mime]!(file)
		stray.send({ type: 'notification', content: 'Parsing the content. Big content could require some minutes...' })
		const content = (await loader.load()).map(d => d.pageContent)
		stray.send({ type: 'notification', content: 'Parsing completed. Starting now the reading process...' })
		const docs = await this.splitTexts(stray, content, chunkSize, chunkOverlap)
		await this.storeDocuments(stray, docs, file.name)
	}

	async ingestPathOrURL(stray: StrayCat, path: string, chunkSize = 512, chunkOverlap = 128) {
		try {
			const url = new URL(path)
			log.info('Ingesting URL...')
			const webHandler = this.webHandlers.find(([regex]) => regex.test(url.href)) ?? this.webHandlers[0]!
			const loader = new webHandler[1](url.href)
			stray.send({ type: 'notification', content: 'Parsing the content. Big content could require some minutes...' })
			const content = (await loader.load()).map(d => d.pageContent)
			stray.send({ type: 'notification', content: 'Parsing completed. Starting now the reading process...' })
			const docs = await this.splitTexts(stray, content, chunkSize, chunkOverlap)
			await this.storeDocuments(stray, docs, url.href)
		}
		catch (error) {
			log.info('The string is not a valid URL, trying with a file-system path...')
			if (!existsSync(path)) { throw new Error('The path does not exist. Skipping ingestion...') }
			const data = readFileSync(resolve(path))
			const file = new File([data], basename(path), { type: extname(path) })
			await this.ingestFile(stray, file, chunkSize, chunkOverlap)
		}
	}

	async storeDocuments(stray: StrayCat, docs: Document[], source: string) {
		log.info(`Preparing to store ${docs.length} documents`)
		docs = madHatter.executeHook('beforeStoreDocuments', docs, stray)
		for (let [i, doc] of docs.entries()) {
			const index = i + 1
			const percRead = Math.round((index / docs.length) * 100)
			const readMsg = `Read ${percRead}% of ${source}`
			stray.send({ type: 'notification', content: readMsg })
			log.warn(readMsg)
			doc.metadata.source = source
			doc.metadata.when = Date.now()
			doc = madHatter.executeHook('beforeInsertInMemory', doc, stray)
			if (doc.pageContent) {
				const docEmbedding = await cheshireCat.currentEmbedder.embedDocuments([doc.pageContent])
				if (docEmbedding.length === 0) {
					log.warn(`Skipped memory insertion of empty document (${index + 1}/${docs.length})`)
					continue
				}
				await cheshireCat.currentMemory.collections.declarative.addPoint(
					doc.pageContent,
					docEmbedding[0]!,
					doc.metadata,
				)
			}
			else log.warn(`Skipped memory insertion of empty document (${index + 1}/${docs.length})`)
			await sleep(1000)
		}
		stray.send({ type: 'notification', content: `Finished reading ${source}. I made ${docs.length} thoughts about it.` })
		log.warn(`Done uploading ${source}`)
	}

	async splitTexts(stray: StrayCat, texts: string[], chunkSize?: number, chunkOverlap?: number) {
		texts = madHatter.executeHook('beforeSplitTexts', texts, stray)
		if (chunkOverlap) { this.splitter.chunkOverlap = chunkOverlap }
		if (chunkSize) { this.splitter.chunkSize = chunkSize }
		log.info('Splitting texts with chunk size', chunkSize, 'and overlap', chunkOverlap)
		const split = await this.splitter.createDocuments(texts)
		let docs = split.filter(d => d.pageContent.length > 10)
		docs = madHatter.executeHook('afterSplitTexts', docs, stray)
		return docs
	}
}

/**
 * Manages content ingestion. I'm late... I'm late!
 */
export const rabbitHole = await RabbitHole.getInstance()
