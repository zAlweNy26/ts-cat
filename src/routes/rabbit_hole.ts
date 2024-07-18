import { t } from 'elysia'
import { authMiddleware, swaggerTags } from '@/context'
import type { App } from '@/main'

export function fileIngestion(app: App) {
	return app.group('/rabbithole', { detail: { tags: [swaggerTags.rh.name] } }, i => i
		.use(authMiddleware)
		.get('/allowed-mimetypes', ({ rh }) => {
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
				}),
			},
		})
		.post('/chunk', async ({ rh, body, query, stray, log, HttpError }) => {
			const { sync, source } = query
			try {
				if (sync) await rh.ingestContent(stray, body.chunk, source)
				else rh.ingestContent(stray, body.chunk).catch(log.error)
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
				chunk: t.Union([t.String(), t.Array(t.String())]),
			}),
			query: t.Object({
				sync: t.BooleanString({ default: true }),
				source: t.String(),
			}),
			detail: {
				description: 'Upload a text chunk whose content will be segmented into smaller chunks. Chunks will be then vectorized and stored into documents memory.',
				summary: 'Upload text chunk',
			},
			response: {
				200: t.Object({
					info: t.String(),
				}),
				400: 'error',
			},
		})
		.post('/file', async ({ rh, body, query, stray, log, HttpError }) => {
			const { file } = body, { sync, chunkOverlap, chunkSize } = query
			try {
				if (sync) await rh.ingestFile(stray, file, chunkSize, chunkOverlap)
				else rh.ingestFile(stray, file, chunkSize, chunkOverlap).catch(log.error)
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
			}),
			query: t.Object({
				sync: t.BooleanString({ default: true }),
				chunkSize: t.Numeric({ default: 256 }),
				chunkOverlap: t.Numeric({ default: 64 }),
			}),
			detail: {
				description: 'Upload a file whose content will be extracted and segmented into chunks. Chunks will be then vectorized and stored into documents memory.',
				summary: 'Upload file',
			},
			response: {
				200: t.Object({
					info: t.String(),
				}),
				400: 'error',
			},
		})
		.post('/files', async ({ rh, body, query, stray, log, HttpError }) => {
			const { files } = body, { sync, chunkOverlap, chunkSize } = query
			try {
				if (sync) {
					for (const file of files)
						await rh.ingestFile(stray, file, chunkSize, chunkOverlap)
				}
				else {
					for (const file of files)
						rh.ingestFile(stray, file, chunkSize, chunkOverlap).catch(log.error)
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
				files: t.Files(),
			}),
			query: t.Object({
				sync: t.BooleanString({ default: true }),
				chunkSize: t.Numeric({ default: 256 }),
				chunkOverlap: t.Numeric({ default: 64 }),
			}),
			detail: {
				description: 'Upload a list of files whose contents will be extracted and segmented into chunks. Chunks will be then vectorized and stored into documents memory.',
				summary: 'Upload files',
			},
			response: {
				200: t.Object({
					info: t.String(),
				}),
				400: 'error',
			},
		})
		.post('/memory', async ({ rh, body, query, log, HttpError }) => {
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
				file: t.File(),
			}),
			query: t.Object({
				sync: t.BooleanString({ default: true }),
			}),
			detail: {
				description: 'Upload a memory json file to the cat memory.',
				summary: 'Upload memory',
			},
			response: {
				200: t.Object({
					info: t.String(),
				}),
				400: 'error',
			},
		})
		.post('/web', async ({ rh, body, query, stray, log, HttpError }) => {
			const { webUrl } = body, { sync, chunkOverlap, chunkSize } = query
			try {
				if (sync) await rh.ingestPathOrURL(stray, webUrl, chunkSize, chunkOverlap)
				else rh.ingestPathOrURL(stray, webUrl, chunkSize, chunkOverlap).catch(log.error)
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
			}),
			query: t.Object({
				sync: t.BooleanString({ default: true }),
				chunkSize: t.Numeric({ default: 256 }),
				chunkOverlap: t.Numeric({ default: 64 }),
			}),
			detail: {
				description: 'Upload a website whose content will be extracted and segmented into chunks. Chunks will be then vectorized and stored into documents memory.',
				summary: 'Upload URL',
			},
			response: {
				200: t.Object({
					info: t.String(),
				}),
				400: 'error',
			},
		}))
}

export type RabbitHoleApp = ReturnType<typeof fileIngestion>
