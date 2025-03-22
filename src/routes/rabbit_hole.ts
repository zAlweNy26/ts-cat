import { Elysia, t } from 'elysia'
import { serverContext, swaggerTags } from '@/context'

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
}).get('/allowed-uris', ({ rh }) => {
	return {
		allowedURIs: rh.webParsers.map(p => p[0].source),
	}
}, {
	detail: {
		description: 'Retrieve the allowed URIs RegEx that can be ingested by the Rabbit Hole.',
		summary: 'Get allowed URIs',
	},
	response: {
		200: t.Object({
			allowedURIs: t.Array(t.String()),
		}, {
			title: 'Allowed URIs',
			description: 'List of allowed URIs RegEx that can be ingested',
			examples: [{
				allowedURIs: ['^.*$', '^https://(www.)?.*/.*.xml$'],
			}],
		}),
		400: 'error',
	},
}).post('/chunk', async ({ rh, body, query, stray, log, HttpError }) => {
	const { sync, source, chatId } = query, { chunk, metadata } = body
	const realStray = chatId ? stray.getChat(chatId) : stray
	try {
		if (sync) await rh.ingestContent(realStray, chunk, source, metadata)
		else rh.ingestContent(realStray, chunk, source, metadata).catch(log.error)
	}
	catch (error) {
		log.error('Error while ingesting chunk:', error)
		throw HttpError.InternalServer('Error while ingesting the passed chunk')
	}
	return {
		info: sync ? 'Chunk has been ingested successfully.' : 'Chunk is being ingested asynchronously...',
	}
}, {
	body: t.Object({
		chunk: t.Union([t.String(), t.Array(t.String())], { title: 'Chunk(s)', description: 'Text content to ingest.' }),
		metadata: t.Optional(t.Record(t.String(), t.Any(), { description: 'Metadata to attach to the ingested content.' })),
	}),
	query: t.Object({
		sync: t.Boolean({ title: 'Synchronous', description: 'Whether to ingest the chunk synchronously', default: true }),
		source: t.String({ title: 'Source', description: 'Source of the chunk', default: 'unknown' }),
		chatId: t.Optional(t.String({ title: 'Chat ID', description: 'The ID of the chat', format: 'uuid' })),
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
}).post('/file', async ({ rh, body, query, stray, log, HttpError }) => {
	const { file, metadata } = body, { sync, chunkOverlap, chunkSize, chatId } = query
	const realStray = chatId ? stray.getChat(chatId) : stray
	try {
		if (sync) await rh.ingestFile(realStray, file, chunkSize, chunkOverlap, metadata)
		else rh.ingestFile(realStray, file, chunkSize, chunkOverlap, metadata).catch(log.error)
	}
	catch (error) {
		log.error('Error while ingesting file:', error)
		throw HttpError.InternalServer('Error while ingesting the passed file')
	}
	return {
		info: sync ? 'File has been ingested successfully.' : 'File is being ingested asynchronously...',
	}
}, {
	body: t.Object({
		file: t.File(),
		metadata: t.Optional(t.Record(t.String(), t.Any(), { description: 'Metadata to attach to the ingested content.' })),
	}),
	query: t.Object({
		sync: t.Boolean({ title: 'Synchronous', description: 'Whether to ingest the plugin synchronously', default: true }),
		chunkSize: t.Number({ title: 'Chunk Size', description: 'Size of the chunks to be created', default: 256 }),
		chunkOverlap: t.Number({ title: 'Chunk Overlap', description: 'Overlap between the chunks', default: 64 }),
		chatId: t.Optional(t.String({ title: 'Chat ID', description: 'The ID of the chat', format: 'uuid' })),
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
}).post('/files', async ({ rh, body, query, stray, log, HttpError }) => {
	const { content } = body, { sync, chunkOverlap, chunkSize, chatId } = query
	const realStray = chatId ? stray.getChat(chatId) : stray
	try {
		if (sync) {
			for (const { file, metadata } of content)
				await rh.ingestFile(realStray, file, chunkSize, chunkOverlap, metadata)
		}
		else {
			for (const { file, metadata } of content)
				rh.ingestFile(realStray, file, chunkSize, chunkOverlap, metadata).catch(log.error)
		}
	}
	catch (error) {
		log.error('Error while ingesting files:', error)
		throw HttpError.InternalServer('Error while ingesting the passed files')
	}
	return {
		info: sync ? 'Files have been ingested successfully.' : 'Files are being ingested asynchronously...',
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
		chatId: t.Optional(t.String({ title: 'Chat ID', description: 'The ID of the chat', format: 'uuid' })),
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
}).post('/web', async ({ rh, body, query, stray, log, HttpError }) => {
	const { webUrl, metadata } = body, { sync, chunkOverlap, chunkSize, chatId } = query
	const realStray = chatId ? stray.getChat(chatId) : stray
	try {
		if (sync) await rh.ingestPathOrURL(realStray, webUrl, chunkSize, chunkOverlap, metadata)
		else rh.ingestPathOrURL(realStray, webUrl, chunkSize, chunkOverlap, metadata).catch(log.error)
	}
	catch (error) {
		log.error('Error while ingesting web url:', error)
		throw HttpError.InternalServer('Error while ingesting the passed url')
	}
	return {
		info: sync ? 'Web page has been ingested successfully.' : 'Web page is being ingested asynchronously...',
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
		sync: t.Boolean({ title: 'Synchronous', description: 'Whether to ingest the website synchronously', default: true }),
		chunkSize: t.Number({ title: 'Chunk Size', description: 'Size of the chunks to be created', default: 256 }),
		chunkOverlap: t.Number({ title: 'Chunk Overlap', description: 'Overlap between the chunks', default: 64 }),
		chatId: t.Optional(t.String({ title: 'Chat ID', description: 'The ID of the chat', format: 'uuid' })),
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
}).post('/memory', async ({ rh, body, query, log, HttpError }) => {
	const { file } = body, { sync } = query
	try {
		if (sync) await rh.ingestMemory(file)
		else rh.ingestMemory(file).catch(log.error)
	}
	catch (error) {
		log.error('Error while ingesting memory file:', error)
		throw HttpError.InternalServer('Error while ingesting the passed memory file')
	}
	return {
		info: sync ? 'Memory file has been ingested successfully.' : 'Memory file is being ingested asynchronously...',
	}
}, {
	body: t.Object({
		file: t.File({ type: 'application/json', description: 'Memory file to ingest. It must be a JSON.' }),
	}),
	query: t.Object({
		sync: t.Boolean({ title: 'Synchronous', description: 'Whether to ingest the memory synchronously', default: true }),
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
