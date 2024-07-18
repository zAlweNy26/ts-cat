import { resolve } from 'node:path'
import { checkPort } from 'get-port-please'
import { cheshireCat } from '@lg/cheshire-cat.ts'
import type { EmbedderApp, LlmApp, MemoryApp, PluginsApp, RabbitHoleApp, SettingsApp } from '@routes'
import { embedder, fileIngestion, llm, memory, plugins, settings } from '@routes'
import isDocker from 'is-docker'
import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { serverTiming } from '@elysiajs/server-timing'
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { madHatter } from '@mh/mad-hatter.ts'
import { httpError } from './errors.ts'
import { db } from './database.ts'
import { logWelcome, parsedEnv } from './utils.ts'
import { apiModels, swaggerTags } from './context.ts'
import { httpLogger, log } from './logger.ts'
import { rabbitHole } from './rabbit-hole.ts'
import pkg from '~/package.json'

const app = new Elysia()
	.decorate({
		cat: cheshireCat,
		mh: madHatter,
		rh: rabbitHole,
		log,
		db,
	})
	.derive(({ headers, cat }) => {
		const user = headers.user || 'user'
		return { stray: cat.getStray(user) || cat.addStray(user) }
	})
	.use(httpLogger())
	.use(httpError())
	.use(serverTiming())
	.use(cors({
		origin: parsedEnv.corsAllowedOrigins,
		methods: '*',
		allowedHeaders: '*',
		credentials: true,
	}))
	.use(staticPlugin({
		prefix: '/assets',
		assets: resolve(process.cwd(), 'src', 'assets'),
	}))
	.use(swagger({
		scalarConfig: {
			searchHotKey: 'f',
			isEditable: false,
			showSidebar: true,
		},
		exclude: ['/docs', '/docs/json'],
		autoDarkMode: true,
		path: '/docs',
		documentation: {
			info: {
				title: '😸 Cheshire Cat API',
				description: pkg.description,
				version: pkg.version,
			},
			tags: Object.values(swaggerTags),
			security: [{ apiKey: ['token'] }],
			components: {
				securitySchemes: {
					token: {
						type: 'apiKey',
						name: 'token',
						in: 'header',
						description: 'Authorization header token',
					},
				},
				headers: {
					user: {
						description: 'User ID header',
						example: 'user',
						schema: { type: 'string' },
					},
				},
			},
		},
	}))
	.use(apiModels())
	.get('/', () => ({
		status: 'We\'re all mad here, dear!',
		version: pkg.version,
		protected: parsedEnv.apiKey !== undefined,
	}), {
		detail: {
			tags: [swaggerTags.status.name],
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
	})
	.ws('/ws/:userId', {
		params: t.Object({
			userId: t.String({ default: 'user' }),
		}),
		body: t.Intersect([
			t.Object({
				text: t.String(),
				save: t.Optional(t.BooleanString()),
			}),
			t.Record(t.String(), t.Any()),
		]),
		open: async (ws) => {
			const { data: { cat, params } } = ws
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
		close: ({ data: { cat, params } }) => {
			const user = params.userId
			cat.removeStray(user)
			log.debug(`User ${user} disconnected from the WebSocket.`)
		},
		message: ({ data: { cat, params, body } }) => {
			const user = params.userId
			const stray = cat.getStray(user)!
			stray.run(body, body.save).then(stray.send).catch(log.error)
		},
		error: ({ error }) => {
			log.dir(error)
		},
	})

export type App = typeof app

app.use(settings)
app.use(llm)
app.use(embedder)
app.use(memory)
app.use(fileIngestion)
app.use(plugins)

export type FullApp = typeof app & SettingsApp & LlmApp &
	EmbedderApp & MemoryApp & PluginsApp & RabbitHoleApp

const inDocker = isDocker()

try {
	const port = inDocker ? 80 : parsedEnv.port
	const host = inDocker ? '0.0.0.0' : parsedEnv.host
	await checkPort(port, host)
	app.listen({
		hostname: parsedEnv.host,
		port: parsedEnv.port,
	})
	await logWelcome()
}
catch (error) {
	log.error(error)
	await app.stop()
	process.exit(1)
}

export default app
