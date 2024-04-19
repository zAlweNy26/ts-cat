import type { MultipartFile } from '@fastify/multipart'
import type { FastifyPluginCallback } from 'fastify'
import { log } from '@logger'
import { rabbitHole } from '@rh'
import { z } from 'zod'
import { SwaggerTags, fileSchema } from '@/context.ts'

export const fileIngestion: FastifyPluginCallback = async (fastify) => {
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
			async: boolean
		}
	}>('/chunk', { schema: {
		description: 'Upload a text chunk whose content will be segmented into smaller chunks. Chunks will be then vectorized and stored into documents memory.',
		tags: [SwaggerTags['Rabbit Hole']],
		summary: 'Upload text chunk',
		body: z.string().min(10),
		querystring: z.object({
			async: z.coerce.boolean().default(false),
		}),
		response: {
			200: z.object({ info: z.string() }),
			400: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const chunk = req.body, { async } = req.query
		try {
			if (async) await rabbitHole.ingestContent(req.stray, chunk)
			else rabbitHole.ingestContent(req.stray, chunk).catch(log.error)
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
		}
		Querystring: {
			async: boolean
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
			async: z.coerce.boolean().default(false),
			chunkSize: z.coerce.number().default(512),
			chunkOverlap: z.coerce.number().default(128),
		}),
		response: {
			200: z.object({ info: z.string() }),
			400: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const { file } = req.body, { async, chunkOverlap, chunkSize } = req.query
		try {
			const uploadFile = new File([await file.toBuffer()], file.filename, { type: file.mimetype })
			if (async) await rabbitHole.ingestFile(req.stray, uploadFile, chunkSize, chunkOverlap).catch(log.error)
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
		Body: string
		Querystring: {
			async: boolean
			chunkSize: number
			chunkOverlap: number
		}
	}>('/web', { schema: {
		description: 'Upload a website whose content will be extracted and segmented into chunks. Chunks will be then vectorized and stored into documents memory.',
		tags: [SwaggerTags['Rabbit Hole']],
		summary: 'Upload URL',
		body: z.string().min(5),
		querystring: z.object({
			async: z.coerce.boolean().default(false),
			chunkSize: z.coerce.number().default(512),
			chunkOverlap: z.coerce.number().default(128),
		}),
		response: {
			200: z.object({ info: z.string() }),
			400: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const webUrl = req.body, { async, chunkOverlap, chunkSize } = req.query
		try {
			if (async) await rabbitHole.ingestPathOrURL(req.stray, webUrl, chunkSize, chunkOverlap)
			else rabbitHole.ingestPathOrURL(req.stray, webUrl, chunkSize, chunkOverlap).catch(log.error)
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
		}
		Querystring: {
			async: boolean
		}
	}>('/memory', { schema: {
		description: 'Upload a memory json file to the cat memory.',
		tags: [SwaggerTags['Rabbit Hole']],
		summary: 'Upload memory',
		consumes: ['multipart/form-data'],
		body: z.object({ file: fileSchema }),
		querystring: z.object({
			async: z.coerce.boolean().default(false),
		}),
		response: {
			200: z.object({ info: z.string() }),
			400: { $ref: 'HttpError' },
		},
	} }, async (req, rep) => {
		const { file } = req.body, { async } = req.query
		try {
			const uploadFile = new File([await file.toBuffer()], file.filename, { type: file.mimetype })
			if (async) await rabbitHole.ingestMemory(uploadFile).catch(log.error)
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
}
