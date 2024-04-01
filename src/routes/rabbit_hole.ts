import type { MultipartFile } from '@fastify/multipart'
import type { FastifyPluginCallback } from 'fastify'
import { log } from '@logger'
import { rabbitHole } from '@rh'

export const fileIngestion: FastifyPluginCallback = (fastify, opts, done) => {
	fastify.get('/allowed-mimetypes', { schema: {
		description: 'Retrieve the allowed mimetypes that can be ingested by the Rabbit Hole.',
		tags: ['Rabbit Hole'],
		summary: 'Get allowed mimetypes',
		response: {
			200: {
				type: 'object',
				properties: {
					allowedMimetypes: {
						type: 'array',
						items: { type: 'string' },
					},
				},
			},
		},
	} }, () => {
		return {
			allowedMimetypes: Object.keys(rabbitHole.fileParsers),
		}
	})

	fastify.post<{
		Body: {
			chunk: string
			async: boolean
		}
	}>('/chunk', { schema: {
		description: 'Upload a text chunk whose content will be segmented into smaller chunks. Chunks will be then vectorized and stored into documents memory.',
		tags: ['Rabbit Hole'],
		summary: 'Upload text chunk',
		body: {
			type: 'object',
			required: ['chunk'],
			properties: {
				chunk: { type: 'string', minLength: 10 },
				async: { type: 'boolean', default: false },
			},
		},
		response: {
			200: { type: 'object', properties: { info: { type: 'string' } } },
			400: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const { chunk, async } = req.body
		try {
			if (async) { await rabbitHole.ingestContent(req.stray, chunk) }
			else rabbitHole.ingestContent(req.stray, chunk)
		}
		catch (error) {
			log.error('Error while ingesting chunk:', error)
			return rep.badRequest('Error while ingesting the passed chunk.')
		}
		return {
			info: async ? 'Chunk is being ingested asynchronously...' : 'Chunk has been ingested successfully.',
		}
	})

	fastify.post<{
		Body: {
			file: MultipartFile
			async: boolean
			chunkSize: number
			chunkOverlap: number
		}
	}>('/file', { schema: {
		description: 'Upload a file whose content will be extracted and segmented into chunks. Chunks will be then vectorized and stored into documents memory.',
		tags: ['Rabbit Hole'],
		summary: 'Upload file',
		consumes: ['multipart/form-data'],
		body: {
			type: 'object',
			required: ['file'],
			properties: {
				file: { isFile: true },
				async: { type: 'boolean', default: false },
				chunkSize: { type: 'number', default: 512 },
				chunkOverlap: { type: 'number', default: 128 },
			},
		},
		response: {
			200: { type: 'object', properties: { info: { type: 'string' } } },
			400: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const { file, async, chunkOverlap, chunkSize } = req.body
		try {
			const uploadFile = new File([await file.toBuffer()], file.filename, { type: file.mimetype })
			if (async) { await rabbitHole.ingestFile(req.stray, uploadFile, chunkSize, chunkOverlap) }
			else rabbitHole.ingestFile(req.stray, uploadFile, chunkSize, chunkOverlap)
		}
		catch (error) {
			log.error('Error while ingesting file:', error)
			return rep.badRequest('Error while ingesting the passed file.')
		}
		return {
			info: async ? 'File is being ingested asynchronously...' : 'File has been ingested successfully.',
		}
	})

	fastify.post<{
		Body: {
			webUrl: string
			async: boolean
			chunkSize: number
			chunkOverlap: number
		}
	}>('/web', { schema: {
		description: 'Upload a website whose content will be extracted and segmented into chunks. Chunks will be then vectorized and stored into documents memory.',
		tags: ['Rabbit Hole'],
		summary: 'Upload URL',
		body: {
			type: 'object',
			required: ['webUrl'],
			properties: {
				webUrl: { type: 'string', minLength: 5 },
				async: { type: 'boolean', default: false },
				chunkSize: { type: 'number', default: 512 },
				chunkOverlap: { type: 'number', default: 128 },
			},
		},
		response: {
			200: { type: 'object', properties: { info: { type: 'string' } } },
			400: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const { webUrl, async, chunkSize, chunkOverlap } = req.body
		try {
			if (async) { await rabbitHole.ingestPathOrURL(req.stray, webUrl, chunkSize, chunkOverlap) }
			else rabbitHole.ingestPathOrURL(req.stray, webUrl, chunkSize, chunkOverlap)
		}
		catch (error) {
			log.error('Error while ingesting web url:', error)
			return rep.badRequest('Error while ingesting the passed url.')
		}
		return {
			info: async ? 'Web page is being ingested asynchronously...' : 'Web page has been ingested successfully.',
		}
	})

	fastify.post<{
		Body: {
			file: MultipartFile
			async: boolean
		}
	}>('/memory', { schema: {
		description: 'Upload a memory json file to the cat memory.',
		tags: ['Rabbit Hole'],
		summary: 'Upload memory',
		consumes: ['multipart/form-data'],
		body: {
			type: 'object',
			required: ['file'],
			properties: {
				file: { isFile: true },
				async: { type: 'boolean', default: false },
			},
		},
		response: {
			200: { type: 'object', properties: { info: { type: 'string' } } },
			400: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const { file, async } = req.body
		try {
			const uploadFile = new File([await file.toBuffer()], file.filename, { type: file.mimetype })
			if (async) { await rabbitHole.ingestMemory(uploadFile) }
			else rabbitHole.ingestMemory(uploadFile)
		}
		catch (error) {
			log.error('Error while ingesting memory file:', error)
			return rep.badRequest('Error while ingesting the passed memory file.')
		}
		return {
			info: async ? 'Memory file is being ingested asynchronously...' : 'Memory file has been ingested successfully.',
		}
	})

	done()
}
