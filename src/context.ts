import { cheshireCat as cat } from '@lg/cheshire-cat.ts'
import { madHatter } from '@mh/mad-hatter.ts'
import { Elysia, t } from 'elysia'
import { db } from './database.ts'
import { httpError } from './errors'
import { log } from './logger.ts'
import { rabbitHole } from './rabbit-hole.ts'
import { parsedEnv } from './utils'

export const swaggerTags = {
	general: {
		name: 'General',
		description: 'Base cat utilities',
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

const jsonLiterals = t.Union([t.String(), t.Number(), t.Boolean(), t.Null()])

export const modelInfo = t.Object({
	name: t.String(),
	humanReadableName: t.String(),
	description: t.String(),
	link: t.Optional(t.String({ format: 'uri' })),
	schema: t.Record(t.String(), t.Any()),
	value: t.Record(t.String(), t.Any()),
}, {
	$id: 'modelInfo',
	examples: [{
		name: 'OpenAILLM',
		humanReadableName: 'OpenAI GPT',
		description: 'More expensive but also more flexible model than ChatGPT',
		link: 'https://platform.openai.com/docs/models/overview',
		schema: {},
		value: {},
	}],
})

export const pluginManifest = t.Object({
	name: t.String(),
	version: t.RegExp(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/, { default: '0.0.1' }),
	description: t.String({ default: 'No description provided' }),
	authorName: t.String({ default: 'Anonymous' }),
	authorUrl: t.Optional(t.String({ format: 'uri' })),
	pluginUrl: t.Optional(t.String({ format: 'uri' })),
	thumb: t.Optional(t.String({ format: 'uri' })),
	tags: t.Array(t.String(), { default: ['miscellaneous', 'unknown'] }),
}, {
	$id: 'pluginManifest',
	examples: [{
		name: 'Core CCat',
		description: 'The core Cat plugin used to define default hooks and tools. You don\'t see this plugin in the plugins folder, because it is an hidden plugin. It will be used to try out hooks and tools before they become available to other plugins. Written and delivered just for you, my furry friend.',
		author_name: 'Cheshire Cat',
		authorUrl: 'https://cheshirecat.ai',
		pluginUrl: 'https://github.com/cheshire-cat-ai/core',
		tags: ['core', 'cat', 'default', 'hidden'],
		version: '0.0.1',
	}],
})

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
}, {
	$id: 'pluginInfo',
	examples: [{
		id: 'core_plugin',
		active: true,
		upgradable: false,
		manifest: {},
		forms: [],
		tools: [],
		hooks: [],
	}],
})

export const pluginSettings = t.Object({
	name: t.String(),
	schema: t.Record(t.String(), t.Any()),
	value: t.Record(t.String(), t.Any()),
}, {
	$id: 'pluginSettings',
	examples: [{
		name: 'Core CCat',
		schema: {},
		value: {},
	}],
})

export const serverContext = new Elysia({ name: 'server-context' }).use(httpError).decorate({
	// cat: cheshireCat, // TODO: Fix RangeError: Maximum call stack size exceeded.
	mh: madHatter,
	rh: rabbitHole,
	log,
	db,
}).onBeforeHandle(({ headers, HttpError }) => {
	const apiKey = headers.token, realKey = parsedEnv.apiKey
	if (realKey && realKey !== apiKey)
		throw HttpError.Unauthorized('Invalid API key')
}).derive({ as: 'global' }, ({ headers }) => {
	const user = headers.user || 'user'
	return { stray: cat.getStray(user) || cat.addStray(user) }
}).model({
	generic: t.Record(t.String(), t.Any(), {
		examples: [{ key: 'value' }],
		$id: 'GenericObject',
	}),
	json: t.Union([jsonLiterals, t.Array(jsonLiterals), t.Record(t.String(), jsonLiterals)], {
		examples: [
			{ key: 'value' },
			['value'],
			'example',
			42,
		],
		$id: 'GenericJson',
	}),
	customSetting: t.Object({
		name: t.String(),
		value: t.Any(),
	}, {
		examples: [{ name: 'key', value: 'value' }],
		$id: 'CustomSetting',
	}),
	modelInfo,
	pluginManifest,
	pluginInfo,
	pluginSettings,
})
