import { Piscina } from 'piscina'
import type { MultipartFile } from '@fastify/multipart'
import type { FastifyPluginCallback } from 'fastify'
import { log } from '@logger'
import { rabbitHole } from '@rh'
import { z } from 'zod'
import { zodBoolean } from '@utils'
import { SwaggerTags, errorSchema, fileSchema } from '@/context.ts'

export const fileIngestion: FastifyPluginCallback = async (fastify) => {
	const worker = new Piscina({
		filename: new URL('../worker.ts', import.meta.url).href,
	})

	fastify.get('/allowed-mimetypes', { schema: {
		description: 'Retrieve the allowed mimetypes that can be ingested by the Rabbit Hole.',
		tags: [SwaggerTags['Rabbit Hole']],
		summary: 'Get allowed mimetypes',
		response: {
			200: z.object({
				allowedMimetypes: z.array(z.string()),
			}),
		},
	} }, () => {
		return {
			allowedMimetypes: Object.keys(rabbitHole.fileParsers),
		}
	})

	fastify.post<{
		Body: string
		Querystring: {
			sync: boolean
			source: string
		}
	}>('/chunk', { schema: {
		description: 'Upload a text chunk whose content will be segmented into smaller chunks. Chunks will be then vectorized and stored into documents memory.',
		tags: [SwaggerTags['Rabbit Hole']],
		summary: 'Upload text chunk',
		body: z.string().min(10),
		querystring: z.object({
			sync: zodBoolean,
			source: z.string().default('unknown'),
		}),
		response: {
			200: z.object({ info: z.string() }),
			400: errorSchema,
		},
	} }, async (req, rep) => {
		const chunk = req.body, { sync, source } = req.query
		try {
			if (sync) await rabbitHole.ingestContent(req.stray, chunk, source)
			else await worker.run({ content: chunk, kind: 'text', stray: req.stray, source })
		}
		catch (error) {
			log.error('Error while ingesting chunk:', error)
			return rep.badRequest('Error while ingesting the passed chunk.')
		}
		return {
			info: sync ? 'Chunk has been ingested successfully.' : 'Chunk is being ingested asynchronously...',
		}
	})

	fastify.post<{
		Body: {
			file: MultipartFile
		}
		Querystring: {
			sync: boolean
			chunkSize: number
			chunkOverlap: number
		}
	}>('/file', { schema: {
		description: 'Upload a file whose content will be extracted and segmented into chunks. Chunks will be then vectorized and stored into documents memory.',
		tags: [SwaggerTags['Rabbit Hole']],
		summary: 'Upload file',
		consumes: ['multipart/form-data'],
		body: z.object({ file: fileSchema }),
		querystring: z.object({
			sync: zodBoolean,
			chunkSize: z.coerce.number().default(256),
			chunkOverlap: z.coerce.number().default(64),
		}),
		response: {
			200: z.object({ info: z.string() }),
			400: errorSchema,
		},
	} }, async (req, rep) => {
		const { file } = req.body, { sync, chunkOverlap, chunkSize } = req.query
		try {
			const uploadFile = new File([await file.toBuffer()], file.filename, { type: file.mimetype })
			if (sync) await rabbitHole.ingestFile(req.stray, uploadFile, chunkSize, chunkOverlap)
			else await worker.run({ content: uploadFile, kind: 'file', stray: req.stray, chunkSize, chunkOverlap })
		}
		catch (error) {
			log.error('Error while ingesting file:', error)
			return rep.badRequest('Error while ingesting the passed file.')
		}
		return {
			info: sync ? 'File has been ingested successfully.' : 'File is being ingested asynchronously...',
		}
	})

	fastify.post<{
		Body: string
		Querystring: {
			sync: boolean
			chunkSize: number
			chunkOverlap: number
		}
	}>('/web', { schema: {
		description: 'Upload a website whose content will be extracted and segmented into chunks. Chunks will be then vectorized and stored into documents memory.',
		tags: [SwaggerTags['Rabbit Hole']],
		summary: 'Upload URL',
		body: z.string().min(5).default('https://example.com').openapi({ description: 'URL of the website or the path of the file to ingest.' }),
		querystring: z.object({
			sync: zodBoolean,
			chunkSize: z.coerce.number().default(256),
			chunkOverlap: z.coerce.number().default(64),
		}),
		response: {
			200: z.object({ info: z.string() }),
			400: errorSchema,
		},
	} }, async (req, rep) => {
		const webUrl = req.body, { sync, chunkOverlap, chunkSize } = req.query
		try {
			if (sync) await rabbitHole.ingestPathOrURL(req.stray, webUrl, chunkSize, chunkOverlap)
			else await worker.run({ content: webUrl, kind: 'url', stray: req.stray, chunkSize, chunkOverlap })
		}
		catch (error) {
			log.error('Error while ingesting web url:', error)
			return rep.badRequest('Error while ingesting the passed url.')
		}
		return {
			info: sync ? 'Web page has been ingested successfully.' : 'Web page is being ingested asynchronously...',
		}
	})

	fastify.post<{
		Body: {
			file: MultipartFile
		}
		Querystring: {
			sync: boolean
		}
	}>('/memory', { schema: {
		description: 'Upload a memory json file to the cat memory.',
		tags: [SwaggerTags['Rabbit Hole']],
		summary: 'Upload memory',
		consumes: ['multipart/form-data'],
		body: z.object({ file: fileSchema }),
		querystring: z.object({
			sync: zodBoolean,
		}),
		response: {
			200: z.object({ info: z.string() }),
			400: errorSchema,
		},
	} }, async (req, rep) => {
		const { file } = req.body, { sync } = req.query
		try {
			const uploadFile = new File([await file.toBuffer()], file.filename, { type: file.mimetype })
			if (sync) await rabbitHole.ingestMemory(uploadFile)
			else await worker.run({ content: uploadFile, kind: 'memory', stray: req.stray })
		}
		catch (error) {
			log.error('Error while ingesting memory file:', error)
			return rep.badRequest('Error while ingesting the passed memory file.')
		}
		return {
			info: sync ? 'Memory file has been ingested successfully.' : 'Memory file is being ingested asynchronously...',
		}
	})
}
