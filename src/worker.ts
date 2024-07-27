import { rabbitHole } from '@rh'
import type { StrayCat } from '@lg/stray-cat.ts'

export type WorkerData = {
	stray: StrayCat
	source?: string
	chunkSize?: number
	chunkOverlap?: number
} & ({
	kind: 'file' | 'memory'
	content: File
} | {
	kind: 'text'
	content: string | string[]
} | {
	kind: 'url'
	content: string
})

export type WorkerResult = { result: true } | { result: false, error: string }

export default async (data: WorkerData): Promise<WorkerResult> => {
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
		return { result: true }
	}
	catch (error) {
		return { result: false, error: (error as Error).message ?? 'Unknown error' }
	}
}
