import { resolve, sep } from 'node:path'
import { cors } from '@elysiajs/cors'
import { serverTiming } from '@elysiajs/server-timing'
import { staticPlugin } from '@elysiajs/static'
import { swagger } from '@elysiajs/swagger'
import { madHatter } from '@mh'
import { embedderRoutes, generalRoutes, llmRoutes, memoryRoutes, pluginsRoutes, rabbitHoleRoutes, settingsRoutes } from '@routes'
import chokidar from 'chokidar'
import { Elysia } from 'elysia'
import { checkPort } from 'get-port-please'
import isDocker from 'is-docker'
import pkg from '~/package.json'
import { serverContext, swaggerTags } from './context.ts'
import { httpLogger, log } from './logger.ts'
import { logWelcome, parsedEnv } from './utils.ts'

chokidar.watch(resolve(process.cwd(), 'plugins'), {
	ignored: path => path.endsWith('settings.json'),
	ignoreInitial: true,
	persistent: true,
}).on('all', async (event, path) => {
	const index = path.indexOf('/plugins')
	const id = path.substring(index).split(sep)[2] ?? ''
	const hasDir = index >= 0 && index + id.length < path.length
	if (id) {
		const plugin = madHatter.getPlugin(id)
		if (!plugin && event === 'addDir') await madHatter.installPlugin(path)
		else if (plugin && event === 'unlinkDir' && !hasDir) await madHatter.removePlugin(id)
		else if (plugin && event !== 'addDir') await madHatter.reloadPlugin(id)
	}
})

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
		assets: resolve(process.cwd(), 'assets'),
	}))
	.use(serverContext)
	.use(await swagger({
		scalarConfig: {
			searchHotKey: 'f',
			isEditable: false,
			showSidebar: true,
			favicon: '/assets/favicon.ico',
			spec: {
				url: '/docs/json',
			},
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
					'token': {
						type: 'apiKey',
						name: 'token',
						in: 'header',
						description: 'Authorization header token',
					},
					'user-id': {
						type: 'apiKey',
						name: 'user-id',
						in: 'header',
						description: 'User ID header',
					},
				},
				headers: { // BUG: Headers not showing in Swagger UI
					'user-id': {
						description: 'User ID header',
						required: false,
						schema: { type: 'string' },
						example: 'user',
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
