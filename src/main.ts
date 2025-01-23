import { resolve } from 'node:path'
import { cors } from '@elysiajs/cors'
import { serverTiming } from '@elysiajs/server-timing'
import { staticPlugin } from '@elysiajs/static'
import { swagger } from '@elysiajs/swagger'
import { embedderRoutes, generalRoutes, llmRoutes, memoryRoutes, pluginsRoutes, rabbitHoleRoutes, settingsRoutes } from '@routes'
import { Elysia } from 'elysia'
import { checkPort } from 'get-port-please'
import pkg from '~/package.json'
import { serverContext, swaggerTags } from './context.ts'
import { httpLogger, log } from './logger.ts'
import { catPaths, logWelcome, parsedEnv } from './utils.ts'

const app = new Elysia()
	.use(httpLogger)
	.use(serverTiming())
	.use(cors({
		origin: parsedEnv.corsAllowedOrigins,
		methods: '*',
		allowedHeaders: '*',
		credentials: true,
	}))
	.use(await staticPlugin({ // BUG: NOT_FOUND error reference at https://github.com/elysiajs/elysia/issues/739
		prefix: '/assets',
		assets: resolve(process.cwd(), 'src', 'assets'),
	}))
	.use(await swagger({
		scalarConfig: {
			searchHotKey: 'f',
			isEditable: false,
			showSidebar: true,
			favicon: '/assets/favicon.ico',
		},
		exclude: ['/docs', '/docs/json'],
		autoDarkMode: true,
		path: '/docs',
		documentation: {
			info: {
				title: 'Cheshire Cat API',
				description: `${pkg.description} 😸`,
				version: pkg.version,
			},
			tags: Object.values(swaggerTags),
			security: [{ token: [] }],
			components: {
				securitySchemes: {
					token: {
						type: 'apiKey',
						name: 'token',
						in: 'header',
						description: 'Authorization header token',
					},
				},
				parameters: {
					userId: {
						name: 'user',
						in: 'header',
						description: 'User ID header',
						required: false,
						schema: { type: 'string' },
						example: 'user',
					},
				},
			},
		},
	}))
	.use(serverContext)
	.use(generalRoutes)
	.use(settingsRoutes)
	.use(llmRoutes)
	.use(embedderRoutes)
	.use(memoryRoutes)
	.use(rabbitHoleRoutes)
	.use(pluginsRoutes)

const { hostname, port } = catPaths.realDomain

try {
	await checkPort(port, hostname)
	app.listen({ hostname, port })
	await logWelcome()
}
catch (error) {
	log.error(error)
	await app.stop()
	process.exit(1)
}

export type App = typeof generalRoutes &
	typeof settingsRoutes &
	typeof llmRoutes &
	typeof embedderRoutes &
	typeof memoryRoutes &
	typeof rabbitHoleRoutes &
	typeof pluginsRoutes
