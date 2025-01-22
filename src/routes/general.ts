import { serverContext, swaggerTags } from '@/context'
import { cheshireCat as cat } from '@lg/cheshire-cat.ts'
import { log } from '@logger'
import { normalizeMessageChunks, parsedEnv } from '@utils'
import { Elysia, t } from 'elysia'
import pkg from '~/package.json'

export const generalRoutes = new Elysia({
	name: 'general',
	detail: { tags: [swaggerTags.general.name] },
}).use(serverContext).ws('/ws/:userId?', {
	params: t.Object({
		userId: t.String({ default: 'user' }),
	}),
	query: t.Object({
		why: t.Boolean({ default: true }),
		save: t.Boolean({ default: true }),
		token: t.String({ default: true }),
	}),
	body: 'messageInput',
	response: 'chatMessage',
	idleTimeout: 300, // TODO: Set a proper idle timeout
	beforeHandle: ({ query, HttpError }) => {
		const apiKey = query.token, realKey = parsedEnv.apiKey
		if (realKey && realKey !== apiKey)
			throw HttpError.Unauthorized('Invalid API key')
	},
	open: async (ws) => {
		const { data: { params } } = ws
		const user = params.userId
		let stray = cat.getStray(user)
		if (stray) stray.addWebSocket(ws)
		else stray = cat.addStray(user, ws)
		log.debug(`User ${user} connected to the WebSocket.`)
		while (stray.wsQueue.length) {
			const message = stray.wsQueue.shift()
			if (message) await stray.send(message)
		}
	},
	close: ({ data: { params } }) => {
		const user = params.userId
		cat.removeStray(user)
		log.debug(`User ${user} disconnected from the WebSocket.`)
	},
	message: ({ data: { params, body, query } }) => {
		const user = params.userId
		const stray = cat.getStray(user)!
		stray.run(body as any, query.save).then(stray.send).catch(log.error)
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
		}, {
			title: 'Server Status',
			description: 'Current server status',
			examples: [{
				status: 'We\'re all mad here, dear!',
				version: '1.0.0',
				protected: false,
			}],
		}),
		400: 'error',
	},
}).post('/chat', async ({ stray, body, query }) => {
	const { save, why } = query
	const res = await stray.run(body, save, why)
	return res
}, {
	body: 'messageInput',
	query: t.Object({
		save: t.Boolean({
			title: 'Save',
			description: 'Whether to save the message in the memory',
			default: true,
		}),
		why: t.Boolean({
			title: 'Why',
			description: 'Whether to include the reasoning in the response',
			default: true,
		}),
	}),
	detail: {
		summary: 'Chat',
		description: 'Get a response from the Cheshire Cat using the RAG.',
	},
	response: {
		200: 'chatMessage',
		400: 'error',
	},
}).post('/pure', async function* ({ stray, body, query }) {
	const { stream } = query

	if (!stream) return normalizeMessageChunks(await stray.llm(body.messages))

	const res = await stray.llm(body.messages, stream)
	for await (const chunk of res) yield normalizeMessageChunks(chunk)
}, {
	body: t.Object({
		messages: t.Array(t.String(), {
			title: 'Messages',
			description: 'The messages to send to the Cheshire Cat',
			default: ['Hello world'],
		}),
	}),
	query: t.Object({
		stream: t.Boolean({
			title: 'Stream',
			description: 'Whether to stream the response or not',
			default: false,
		}),
	}),
	detail: {
		summary: 'Pure llm',
		description: 'Get a pure LLM response from the Cheshire Cat.',
	},
	response: {
		200: t.Union([t.String(), t.Record(t.String(), t.Any())]),
		400: 'error',
	},
}).post('/embed', async ({ stray, body }) => {
	const res = await stray.currentEmbedder.embedQuery(body.text)
	return res
}, {
	body: t.Object({
		text: t.String({
			title: 'Text',
			description: 'The text to embed using the current selected embedder',
			default: 'Hello world',
		}),
	}),
	detail: {
		summary: 'Pure embed',
		description: 'Get a pure Embedder response from the Cheshire Cat.',
	},
	response: {
		200: t.Array(t.Number(), {
			title: 'Embedding',
			description: 'Embedding response',
			examples: [[0.1, 0.2, 0.3]],
		}),
		400: 'error',
	},
})
