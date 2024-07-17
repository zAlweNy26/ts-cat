import { type Elysia, t } from 'elysia'
import { parsedEnv } from './utils'
import { log } from './logger'

export const swaggerTags = {
	status: {
		name: 'Status',
		description: 'Server status',
	},
	settings: {
		name: 'Settings',
		description: 'Database settings',
	},
	plugins: {
		name: 'Plugins',
		description: 'Plugin management',
	},
	llm: {
		name: 'LLM',
		description: 'Large Language model management',
	},
	embedder: {
		name: 'Embedder',
		description: 'Embedder model management',
	},
	rh: {
		name: 'RabbitHole',
		description: 'File ingestion handler',
	},
	memory: {
		name: 'Memory',
		description: 'Memory management',
	},
} as const

export class UnauthorizedError extends Error {
	code = 'UNAUTHORIZED'
	status = 401

	constructor(message?: string) {
		super(message ?? 'UNAUTHORIZED')
	}
}

const jsonLiterals = t.Union([t.String(), t.Number(), t.Boolean(), t.Null()])

export function authMiddleware(app: Elysia) {
	return app.onBeforeHandle(({ headers }) => {
		const apiKey = headers.token, realKey = parsedEnv.apiKey
		if (realKey && realKey !== apiKey)
			throw new UnauthorizedError('Invalid API key')
	})
}

export const modelInfo = t.Object({
	name: t.String(),
	humanReadableName: t.String(),
	description: t.String(),
	link: t.Optional(t.String({ format: 'uri' })),
	schema: t.Record(t.String(), t.Any()),
	value: t.Record(t.String(), t.Any()),
}, { $id: 'modelInfo' })

export const pluginManifest = t.Object({
	name: t.String(),
	version: t.RegExp(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/, { default: '0.0.1' }),
	description: t.String({ default: 'No description provided' }),
	authorName: t.String({ default: 'Anonymous' }),
	authorUrl: t.Optional(t.String({ format: 'uri' })),
	pluginUrl: t.Optional(t.String({ format: 'uri' })),
	thumb: t.Optional(t.String({ format: 'uri' })),
	tags: t.Array(t.String(), { default: ['miscellaneous', 'unknown'] }),
}, { $id: 'pluginManifest' })

export const pluginInfo = t.Object({
	id: t.String(),
	active: t.Boolean(),
	upgradable: t.Boolean(),
	manifest: t.Ref(pluginManifest),
	forms: t.Array(t.Object({
		name: t.String(),
		description: t.String(),
		active: t.Boolean(),
	})),
	tools: t.Array(t.Object({
		name: t.String(),
		description: t.String(),
		active: t.Boolean(),
	})),
	hooks: t.Array(t.Object({
		name: t.String(),
		priority: t.Number(),
	})),
}, { $id: 'pluginInfo' })

export const pluginSettings = t.Object({
	name: t.String(),
	schema: t.Record(t.String(), t.Any()),
	value: t.Record(t.String(), t.Any()),
}, { $id: 'pluginSettings' })

export function apiModels(app: Elysia) {
	return app.onError(({ code, error }) => {
		log.error(error)
		return {
			code,
			message: error.message,
			status: 'status' in error ? error.status : 400,
		}
	}).model({
		error: t.Object({
			code: t.String(),
			message: t.String(),
			status: t.Number(),
		}, {
			examples: [{
				code: 'UNKNOWN',
				message: 'The request was invalid.',
				status: 400,
			}],
		}),
		generic: t.Record(t.String(), t.Any(), { examples: [{ key: 'value' }] }),
		json: t.Union([jsonLiterals, t.Array(jsonLiterals), t.Record(t.String(), jsonLiterals)], {
			examples: [
				{ key: 'value' },
				['value'],
				'example',
				42,
			],
		}),
		customSetting: t.Object({
			name: t.String(),
			value: t.Any(),
		}),
		modelInfo,
		pluginManifest,
		pluginInfo,
		pluginSettings,
	})
}
