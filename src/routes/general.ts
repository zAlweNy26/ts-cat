import { Elysia, t } from 'elysia'
import { cheshireCat as cat } from '@lg/cheshire-cat.ts'
import { log } from '@logger'
import { normalizeMessageChunks, parsedEnv } from '@utils'
import { serverContext, swaggerTags } from '@/context'
import pkg from '~/package.json'

export const generalRoutes = new Elysia({
	name: 'general',
	detail: { tags: [swaggerTags.general.name] },
}).use(serverContext)
	.ws('/ws/:userId?', {
		params: t.Object({
			userId: t.String({ default: 'user' }),
		}),
		body: t.Intersect([
			t.Object({
				text: t.String(),
				save: t.Optional(t.Boolean()),
			}),
			t.Record(t.String(), t.Any()),
		]),
		open: async (ws) => {
			const { data: { params } } = ws
			const user = params.userId
			let stray = cat.getStray(user)
			if (stray) stray.addWebSocket(ws)
			else stray = cat.addStray(user, ws)
			log.debug(`User ${user} connected to the WebSocket.`)
			while (stray.wsQueue.length) {
				const message = stray.wsQueue.shift()
				if (message) stray.send(message)
			}
		},
		close: ({ data: { params } }) => {
			const user = params.userId
			cat.removeStray(user)
			log.debug(`User ${user} disconnected from the WebSocket.`)
		},
		message: ({ data: { params, body } }) => {
			const user = params.userId
			const stray = cat.getStray(user)!
			stray.run(body, body.save).then(stray.send).catch(log.error)
		},
		error: ({ error }) => {
			log.dir(error)
		},
	}).get('/', () => ({
		status: 'We\'re all mad here, dear!',
		version: pkg.version,
		protected: parsedEnv.apiKey !== undefined,
	}), {
		detail: {
			summary: 'Get server status',
			description: 'Retrieve the current server status.',
		},
		response: {
			200: t.Object({
				status: t.String(),
				version: t.String(),
				protected: t.Boolean(),
			}),
			400: 'error',
		},
	}).post('/chat', async ({ stray, body, query }) => {
		const { save } = query
		const res = await stray.run(body, save)
		return res
	}, {
		body: t.Object({
			text: t.String({ default: 'Hello world' }),
		}),
		query: t.Object({
			save: t.Boolean({ default: true }),
		}),
		detail: {
			summary: 'Chat',
			description: 'Get a response from the Cheshire Cat using the RAG.',
		},
		response: {
			200: t.Record(t.String(), t.Any()),
			400: 'error',
		},
	})
