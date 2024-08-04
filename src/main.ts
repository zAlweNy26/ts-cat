import { resolve } from 'node:path'
import { checkPort } from 'get-port-please'
import { embedderRoutes, generalRoutes, llmRoutes, memoryRoutes, pluginsRoutes, rabbitHoleRoutes, settingsRoutes } from '@routes'
import isDocker from 'is-docker'
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { serverTiming } from '@elysiajs/server-timing'
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { logWelcome, parsedEnv } from './utils.ts'
import { swaggerTags } from './context.ts'
import { httpLogger, log } from './logger.ts'
import pkg from '~/package.json'

const app = new Elysia()
	.use(httpLogger())
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
	.use(generalRoutes)
	.use(settingsRoutes)
	.use(llmRoutes)
	.use(embedderRoutes)
	.use(memoryRoutes)
	.use(rabbitHoleRoutes)
	.use(pluginsRoutes)

const inDocker = isDocker()

try {
	const port = inDocker ? 80 : parsedEnv.port
	const hostname = inDocker ? '0.0.0.0' : parsedEnv.host
	await checkPort(port, hostname)
	app.listen({ hostname, port })
	await logWelcome()
}
catch (error) {
	log.error(error)
	await app.stop()
	process.exit(1)
}

export default app
