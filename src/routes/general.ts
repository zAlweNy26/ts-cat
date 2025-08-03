import { log } from '@logger'
import { normalizeMessageChunks, parsedEnv } from '@utils'
import { Elysia, t } from 'elysia'
import { v4 as uuidv4 } from 'uuid'
import { serverContext, swaggerTags } from '@/context'
import pkg from '~/package.json'

export const generalRoutes = new Elysia({
	name: 'general',
	detail: { tags: [swaggerTags.general.name] },
}).use(serverContext).ws('/ws/:userId?', {
	params: t.Object({
		userId: t.String({ default: 'user' }),
	}),
	query: t.Object({
		why: t.Boolean({ default: false }),
		save: t.Boolean({ default: true }),
		chatId: t.Optional(t.String({ format: 'uuid' })),
		token: t.Optional(t.String()),
	}),
	body: 'messageInput',
	idleTimeout: 300, // QUESTION: Should this be a configurable value?
	beforeHandle: ({ query, HttpError }) => {
		const apiKey = query.token, realKey = parsedEnv.apiKey
		if (realKey && realKey !== apiKey) throw HttpError.Unauthorized('Invalid API key')
	},
	open: async ({ data: { params, query, cat } }) => {
		const { userId, chatId = uuidv4() } = { ...params, ...query }
		const stray = cat.getStray(userId), kitten = stray.getChat(chatId)
		log.debug(`User ${userId} connected to the WebSocket with chat ID ${chatId}`)
		while (kitten.wsQueue.length) {
			const message = kitten.wsQueue.shift()
			if (message) await kitten.send(message)
		}
	},
	close: ({ data: { params, cat } }) => {
		const user = params.userId
		cat.removeStray(user)
		log.debug(`User ${user} disconnected from the WebSocket.`)
	},
	message: async ({ data: { params, query, cat } }, body) => {
		if (!body) return
		const { userId, save, why, chatId = uuidv4() } = { ...params, ...query }
		const stray = cat.getStray(userId), kitten = stray.getChat(chatId)
		try {
			const res = await kitten.run(body, save, why)
			await kitten.send(res)
		}
		catch (error) {
			log.error(error)
		}
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
}).get('/chat/list', async ({ stray }) => {
	return stray.getAvailableChats()
}, {
	detail: {
		summary: 'List chat',
		description: 'Get the list of available chats.',
	},
	response: {
		200: t.Array(t.String()),
		400: 'error',
	},
}).post('/chat/:chatId?', async ({ params, stray, body, query, HttpError }) => {
	const { chatId } = params
	const { save, why } = query

	if (chatId && !stray.hasChat(chatId)) throw HttpError.NotFound('Chat not found.')

	const kitten = stray.getChat(chatId || uuidv4())

	return await kitten.run(body, save, why)
}, {
	body: 'messageInput',
	params: t.Object({
		chatId: t.Optional(t.String({
			title: 'Chat ID',
			description: 'The ID of the chat',
			format: 'uuid',
		})),
	}),
	query: t.Object({
		save: t.Boolean({
			title: 'Save',
			description: 'Whether to start or continue a chat',
			default: true,
		}),
		why: t.Boolean({
			title: 'Why',
			description: 'Whether to include the reasoning in the response',
			default: false,
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
}).post('/pure', async function* ({ body, query, cat }) {
	const { stream } = query

	if (!stream) return normalizeMessageChunks(await cat.pure(body.messages))

	const res = await cat.pure(body.messages, stream)
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
}).post('/embed', async ({ body, cat }) => {
	const res = await cat.currentEmbedder.embedQuery(body.text)
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
