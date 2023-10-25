import path from 'node:path'
import Fastify from 'fastify'
import ws from '@fastify/websocket'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import formbody from '@fastify/formbody'
import multipart, { ajvFilePlugin } from '@fastify/multipart'
import sensible from '@fastify/sensible'
import cors from '@fastify/cors'
import statics from '@fastify/static'
import underPressure from '@fastify/under-pressure'
// import { serializerCompiler, validatorCompiler, ZodTypeProvider, jsonSchemaTransform } from "@benjaminlindberg/fastify-type-provider-zod"
import requestLogger from '@mgcrea/fastify-request-logger'
import qs from 'qs'
import pkg from '../package.json' assert { type: 'json' }
import { logWelcome, parsedEnv } from './utils.ts'
import { cheshireCat } from './looking_glass/cheshire-cat.ts'
import type { StrayCat } from './looking_glass/stray-cat.ts'
import { embedder, fileIngestion, llm, memory, plugins, settings, status, websocket } from './routes/index.ts'

declare module 'fastify' {
	export interface FastifyRequest {
		stray: StrayCat
	}
}

const fastify = Fastify({
	logger: {
		level: parsedEnv.logLevel,
		customLevels: {
			error: 60,
			warning: 40,
			normal: 30,
			info: 20,
			debug: 0,
		},
		levelComparison: 'DESC',
		transport: {
			target: '@mgcrea/pino-pretty-compact',
			options: {
				translateTime: 'HH:MM:ss',
				ignore: 'pid,hostname',
				levelFirst: true,
				colorize: true,
			},
		},
	},
	disableRequestLogging: true,
	ajv: {
		plugins: [ajvFilePlugin],
	},
})

// fastify.setValidatorCompiler(validatorCompiler)
// fastify.setSerializerCompiler(serializerCompiler)

// Register plugins
await fastify.register(requestLogger)
await fastify.register(underPressure)
await fastify.register(statics, {
	prefix: '/assets',
	root: path.resolve(process.cwd(), 'src', 'assets'),
})
await fastify.register(sensible, {
	sharedSchemaId: 'HttpError',
})
await fastify.register(ws)
await fastify.register(formbody, { parser: str => qs.parse(str) })
await fastify.register(multipart, {
	attachFieldsToBody: true,
})
await fastify.register(cors, {
	origin: parsedEnv.corsAllowedOrigins,
	methods: '*',
	allowedHeaders: '*',
	credentials: true,
})
fastify.addSchema({
	$id: 'ModelInfo',
	type: 'object',
	required: ['name', 'description', 'humanReadableName', 'schema', 'value'],
	properties: {
		name: { type: 'string' },
		humanReadableName: { type: 'string' },
		link: { type: 'string' },
		description: { type: 'string' },
		schema: { type: 'object', additionalProperties: true },
		value: { type: 'object', additionalProperties: true },
	},
})
fastify.addSchema({
	$id: 'PluginSetting',
	type: 'object',
	required: ['name', 'schema', 'value'],
	properties: {
		name: { type: 'string' },
		schema: { type: 'object', additionalProperties: true },
		value: { type: 'object', additionalProperties: true },
	},
})
fastify.addSchema({
	$id: 'PluginInfo',
	type: 'object',
	required: ['id', 'active', 'manifest'],
	properties: {
		id: { type: 'string' },
		active: { type: 'boolean' },
		manifest: {
			type: 'object',
			required: ['name', 'description', 'version', 'authorName', 'tags'],
			properties: {
				name: { type: 'string' },
				description: { type: 'string' },
				version: { type: 'string' },
				authorName: { type: 'string' },
				authorUrl: { type: 'string' },
				pluginUrl: { type: 'string' },
				thumb: { type: 'string' },
				tags: { type: 'array', items: { type: 'string' } },
			},
		},
		upgradable: { type: 'boolean' },
		forms: {
			type: 'array',
			items: {
				type: 'object',
				required: ['name', 'description', 'active'],
				properties: {
					name: { type: 'string' },
					description: { type: 'string' },
					active: { type: 'boolean' },
				},
			},
		},
		tools: {
			type: 'array',
			items: {
				type: 'object',
				required: ['name', 'description', 'active'],
				properties: {
					name: { type: 'string' },
					description: { type: 'string' },
					active: { type: 'boolean' },
				},
			},
		},
		hooks: {
			type: 'array',
			items: {
				type: 'object',
				required: ['name', 'priority'],
				properties: {
					name: { type: 'string' },
					priority: { type: 'number' },
				},
			},
		},
	},
})
fastify.addSchema({
	$id: 'Setting',
	type: 'object',
	required: ['name', 'value'],
	properties: {
		name: { type: 'string' },
		value: {
			anyOf: [
				{ type: 'object', additionalProperties: true },
				{ type: 'boolean' },
				{ type: 'array' },
				{ type: 'string' },
				{ type: 'number' },
			],
		},
	},
})
await fastify.register(swagger, {
	// transform: jsonSchemaTransform,
	openapi: {
		info: {
			title: '😸 Cheshire Cat API',
			description: pkg.description,
			version: pkg.version,
		},
		servers: [{
			url: 'http://localhost:1865',
		}],
		components: {
			securitySchemes: {
				apiKey: {
					type: 'apiKey',
					name: 'token',
					in: 'header',
					description: 'Authorization header token',
				},
			},
		},
		security: [{ apiKey: ['token'] }],
		tags: [
			{ name: 'Status', description: 'Status' },
			{ name: 'Settings', description: 'Settings' },
			{ name: 'LLM', description: 'Large Language Model' },
			{ name: 'Embedder', description: 'Embedder' },
			{ name: 'Plugins', description: 'Plugins' },
			{ name: 'Rabbit Hole', description: 'Rabbit Hole' },
			{ name: 'Memory', description: 'Memory' },
		],
	},
})
await fastify.register(swaggerUi, {
	routePrefix: '/docs',
	uiConfig: {
		docExpansion: 'list',
		deepLinking: false,
		withCredentials: true,
	},
})

// Register routes
await fastify.register(status)
await fastify.register(settings, { prefix: '/settings' })
await fastify.register(llm, { prefix: '/llm' })
await fastify.register(embedder, { prefix: '/embedder' })
await fastify.register(memory, { prefix: '/memory' })
await fastify.register(plugins, { prefix: '/plugins' })
await fastify.register(fileIngestion, { prefix: '/rabbithole' })
await fastify.register(websocket, { prefix: '/ws' })

// Register hooks
fastify.addHook('preParsing', async (req, rep) => {
	const apiKey = req.headers.token, realKey = parsedEnv.apiKey
	const publicRoutes = ['/docs', '/public', '/ws']

	// Check if the request has a valid API key
	if (realKey && realKey !== apiKey && req.url !== '/' && !publicRoutes.some(url => req.url.startsWith(url))) {
		return rep.unauthorized('Invalid API key')
	}

	// Add a StrayCat instance to the request object
	const userId = (Array.isArray(req.headers.userId) ? req.headers.userId[0] : req.headers.userId) || 'user'
	const stray = cheshireCat.getStray(userId)
	if (!stray) { req.stray = cheshireCat.addStray(userId) }
	else req.stray = stray
})

try {
	await fastify.listen({
		host: parsedEnv.host,
		port: parsedEnv.port,
	})
	await fastify.ready()
	fastify.swagger()
	logWelcome()
}
catch (err) {
	fastify.log.error(err)
	process.exit(1)
}
