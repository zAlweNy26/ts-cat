import { log } from '@logger'
import { rabbitHole } from '@rh'
import type { StrayCat } from '@lg/stray-cat.ts'

type WorkerData = {
	stray: StrayCat
	source?: string
	chunkSize?: number
	chunkOverlap?: number
} & ({
	kind: 'file' | 'memory'
	content: File
} | {
	kind: 'text' | 'url'
	content: string
})

export default async (data: WorkerData) => {
	const { stray, chunkSize, chunkOverlap, content, kind, source } = {
		chunkSize: 256,
		chunkOverlap: 64,
		source: 'unknown',
		...data,
	}
	try {
		switch (kind) {
			case 'file':
				await rabbitHole.ingestFile(stray, content, chunkSize, chunkOverlap)
				break
			case 'memory':
				await rabbitHole.ingestMemory(content)
				break
			case 'text':
				await rabbitHole.ingestContent(stray, content, source)
				break
			case 'url':
				await rabbitHole.ingestPathOrURL(stray, content, chunkSize, chunkOverlap)
				break
			default:
				throw new Error('Unknown kind of content to ingest.')
		}
	}
	catch (error) {
		log.error('Error while ingesting:', error)
	}
}
