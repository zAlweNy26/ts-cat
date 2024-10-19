import { serverContext, swaggerTags } from '@/context'
import { Elysia, t } from 'elysia'

export const rabbitHoleRoutes = new Elysia({
	name: 'rabbithole',
	prefix: '/rabbithole',
	detail: { tags: [swaggerTags.rh.name] },
}).use(serverContext).get('/allowed-mimetypes', ({ rh }) => {
	return {
		allowedMimetypes: Object.keys(rh.fileParsers),
	}
}, {
	detail: {
		description: 'Retrieve the allowed mimetypes that can be ingested by the Rabbit Hole.',
		summary: 'Get allowed mimetypes',
	},
	response: {
		200: t.Object({
			allowedMimetypes: t.Array(t.String()),
		}, {
			title: 'Allowed Mimetypes',
			description: 'List of allowed mimetypes that can be ingested',
			examples: [{
				allowedMimetypes: ['text/plain', 'application/pdf', 'application/json'],
			}],
		}),
		400: 'error',
	},
}).post('/chunk', async ({ rh, body, query, stray, turbit, log, HttpError }) => {
	const { source } = query, { chunk, metadata } = body
	try {
		const { stats } = await turbit.run(rh.ingestContent, {
			type: 'extended',
			args: [stray, source, metadata],
			data: [chunk],
		})
		log.debug('Ingestion of chunk usage:')
		log.debug(stats)
	}
	catch (error) {
		log.error('Error while ingesting chunk:', error)
		throw HttpError.InternalServer('Error while ingesting the passed chunk')
	}
	return {
		info: 'Chunk has been ingested successfully.',
	}
}, {
	body: t.Object({
		chunk: t.Union([t.String(), t.Array(t.String())], { title: 'Chunk(s)', description: 'Text content to ingest.' }),
		metadata: t.Optional(t.Record(t.String(), t.Any(), { description: 'Metadata to attach to the ingested content.' })),
	}),
	query: t.Object({
		source: t.String({ title: 'Source', description: 'Source of the chunk', default: 'unknown' }),
	}),
	detail: {
		description: 'Upload a text chunk whose content will be segmented into smaller chunks. Chunks will be then vectorized and stored into documents memory.',
		summary: 'Upload text chunk',
	},
	response: {
		200: t.Object({
			info: t.String(),
		}, {
			title: 'Chunk ingested',
			description: 'Chunk ingested successfully',
		}),
		400: 'error',
		500: 'error',
	},
}).post('/file', async ({ rh, body, query, stray, turbit, log, HttpError }) => {
	const { file, metadata } = body, { chunkOverlap, chunkSize } = query
	try {
		const { stats } = await turbit.run(rh.ingestFile, {
			type: 'extended',
			args: [stray, chunkSize, chunkOverlap, metadata],
			data: [file],
		})
		log.debug('Ingestion of file usage:')
		log.debug(stats)
	}
	catch (error) {
		log.error('Error while ingesting file:', error)
		throw HttpError.InternalServer('Error while ingesting the passed file')
	}
	return {
		info: 'File has been ingested successfully.',
	}
}, {
	body: t.Object({
		file: t.File(),
		metadata: t.Optional(t.Record(t.String(), t.Any(), { description: 'Metadata to attach to the ingested content.' })),
	}),
	query: t.Object({
		chunkSize: t.Number({ title: 'Chunk Size', description: 'Size of the chunks to be created', default: 256 }),
		chunkOverlap: t.Number({ title: 'Chunk Overlap', description: 'Overlap between the chunks', default: 64 }),
	}),
	detail: {
		description: 'Upload a file whose content will be extracted and segmented into chunks. Chunks will be then vectorized and stored into documents memory.',
		summary: 'Upload file',
	},
	response: {
		200: t.Object({
			info: t.String(),
		}, {
			title: 'File ingested',
			description: 'File ingested successfully',
		}),
		400: 'error',
		500: 'error',
	},
}).post('/files', async ({ rh, body, query, stray, turbit, log, HttpError }) => {
	const { content } = body, { chunkOverlap, chunkSize } = query
	try {
		const { stats } = await turbit.run(rh.ingestFiles, {
			type: 'extended',
			args: [stray, chunkSize, chunkOverlap],
			data: [content],
		})
		log.debug('Ingestion of file usage:')
		log.debug(stats)
	}
	catch (error) {
		log.error('Error while ingesting files:', error)
		throw HttpError.InternalServer('Error while ingesting the passed files')
	}
	return {
		info: 'Files have been ingested successfully.',
	}
}, {
	body: t.Object({
		content: t.Array(t.Object({
			file: t.File(),
			metadata: t.Optional(t.Record(t.String(), t.Any(), { description: 'Metadata to attach to the ingested content.' })),
		})),
	}),
	query: t.Object({
		sync: t.Boolean({ title: 'Synchronous', description: 'Whether to ingest the plugins synchronously', default: true }),
		chunkSize: t.Number({ title: 'Chunk Size', description: 'Size of the chunks to be created', default: 256 }),
		chunkOverlap: t.Number({ title: 'Chunk Overlap', description: 'Overlap between the chunks', default: 64 }),
	}),
	detail: {
		description: 'Upload a list of files whose contents will be extracted and segmented into chunks. Chunks will be then vectorized and stored into documents memory.',
		summary: 'Upload files',
	},
	response: {
		200: t.Object({
			info: t.String(),
		}, {
			title: 'Files ingested',
			description: 'Files ingested successfully',
		}),
		400: 'error',
		500: 'error',
	},
}).post('/web', async ({ rh, body, query, stray, turbit, log, HttpError }) => {
	const { webUrl, metadata } = body, { chunkOverlap, chunkSize } = query
	try {
		const { stats } = await turbit.run(rh.ingestPathOrURL, {
			type: 'extended',
			args: [stray, chunkSize, chunkOverlap, metadata],
			data: [webUrl],
		})
		log.debug('Ingestion of file usage:')
		log.debug(stats)
	}
	catch (error) {
		log.error('Error while ingesting web url:', error)
		throw HttpError.InternalServer('Error while ingesting the passed url')
	}
	return {
		info: 'Web page has been ingested successfully.',
	}
}, {
	body: t.Object({
		webUrl: t.String({
			format: 'uri',
			default: 'https://example.com',
			description: 'URL of the website or the path of the file to ingest.',
		}),
		metadata: t.Optional(t.Record(t.String(), t.Any(), { description: 'Metadata to attach to the ingested content.' })),
	}),
	query: t.Object({
		chunkSize: t.Number({ title: 'Chunk Size', description: 'Size of the chunks to be created', default: 256 }),
		chunkOverlap: t.Number({ title: 'Chunk Overlap', description: 'Overlap between the chunks', default: 64 }),
	}),
	detail: {
		description: 'Upload a website whose content will be extracted and segmented into chunks. Chunks will be then vectorized and stored into documents memory.',
		summary: 'Upload URL',
	},
	response: {
		200: t.Object({
			info: t.String(),
		}, {
			title: 'URL ingested',
			description: 'URL ingested successfully',
		}),
		400: 'error',
		500: 'error',
	},
}).post('/memory', async ({ rh, body, turbit, log, HttpError }) => {
	const { file } = body
	try {
		const { stats } = await turbit.run(rh.ingestMemory, {
			type: 'extended',
			args: [],
			data: [file],
		})
		log.debug('Ingestion of file usage:')
		log.debug(stats)
	}
	catch (error) {
		log.error('Error while ingesting memory file:', error)
		throw HttpError.InternalServer('Error while ingesting the passed memory file')
	}
	return {
		info: 'Memory file has been ingested successfully.',
	}
}, {
	body: t.Object({
		file: t.File({ description: 'Memory file to ingest. It must be a JSON.' }),
	}),
	detail: {
		description: 'Upload a memory json file to the cat memory.',
		summary: 'Upload memory',
	},
	response: {
		200: t.Object({
			info: t.String(),
		}, {
			title: 'Memory ingested',
			description: 'Memory ingested successfully',
		}),
		400: 'error',
		500: 'error',
	},
})
