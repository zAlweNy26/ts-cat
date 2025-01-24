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

export const messageInput = t.Intersect([
	t.Object({
		text: t.String(),
	}),
	t.Record(t.String(), t.Any()),
], {
	$id: 'messageInput',
	title: 'Message Input',
	description: 'Message to pass to the cat',
	default: { text: 'Hello, world' },
	examples: [{
		text: 'Hello, world',
	}],
})

export const memoryMessage = t.Object({
	role: t.Union([t.Literal('AI'), t.Literal('User')]),
	what: t.String(),
	who: t.String(),
	when: t.Number(),
	why: t.Optional(t.Object({
		input: t.String(),
		intermediateSteps: t.Array(t.Object({
			procedure: t.String(),
			input: t.Union([t.String(), t.Null()]),
			observation: t.String(),
		})),
		memory: t.Intersect([
			t.Object({
				episodic: t.Array(t.Record(t.String(), t.Any())),
				declarative: t.Array(t.Record(t.String(), t.Any())),
				procedural: t.Array(t.Record(t.String(), t.Any())),
			}),
			t.Record(t.String(), t.Array(t.Record(t.String(), t.Any()))),
		]),
		interactions: t.Array(t.Record(t.String(), t.Any())),
	})),
}, {
	$id: 'memoryMessage',
	title: 'Memory Message',
	description: 'Content object saved in memory',
})

export const chatMessage = t.Union([
	t.Object({
		type: t.Literal('error'),
		name: t.String(),
		description: t.String(),
	}),
	t.Object({
		type: t.Union([t.Literal('token'), t.Literal('notification')]),
		content: t.String(),
	}),
	t.Intersect([
		t.Object({
			type: t.Literal('chat'),
		}),
		t.Ref('memoryMessage'),
	]),
], {
	$id: 'chatMessage',
	title: 'Chat Message',
	description: 'Message object received from the cat',
})

export const memoryRecall = t.Object({
	query: t.Object({
		text: t.String(),
		vector: t.Array(t.Number()),
	}),
	vectors: t.Object({
		embedder: t.String(),
		collections: t.Record(t.String(), t.Array(t.Object({
			id: t.String(),
			vector: t.Array(t.Number()),
			score: t.Number(),
			pageContent: t.String(),
			metadata: t.Optional(t.Record(t.String(), t.Any())),
		}))),
	}),
}, {
	title: 'Recalled memories',
	description: 'Recalled memories from memory collections',
	examples: [{
		query: {
			text: 'Hello, world!',
			vector: [0.1, 0.2, 0.3],
		},
		vectors: {
			embedder: 'OpenAIEmbedder',
			collections: {
				declarative: [],
				procedural: [],
				episodic: [
					{
						id: '1da746f8-a832-4a45-a120-4549e17a1df7',
						score: 0.8,
						vector: [0.1, 0.2, 0.3],
						pageContent: 'Hello, John!',
						metadata: {
							source: 'user',
							when: 1712950290994,
						},
					},
				],
			},
		},
	}],
})

export const modelInfo = t.Object({
	id: t.String(),
	name: t.String(),
	description: t.String(),
	link: t.Optional(t.String({ format: 'uri' })),
	schema: t.Record(t.String(), t.Any()),
	value: t.Record(t.String(), t.Any()),
}, {
	$id: 'modelInfo',
	title: 'Model Information',
	description: 'Information about a model',
	examples: [{
		id: 'ChatOpenAI',
		name: 'OpenAI GPT',
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
	title: 'Plugin Manifest',
	description: 'The manifest information of a plugin',
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
	manifest: t.Ref('pluginManifest'),
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
	title: 'Plugin Information',
	description: 'Information about a plugin (including its manifest)',
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
	title: 'Plugin Settings',
	description: 'Current settings for a plugin',
	examples: [{
		name: 'Core CCat',
		schema: {},
		value: {},
	}],
})

const whitelistedPaths = ['/docs', '/assets', '/ws']

export const serverContext = new Elysia({ name: 'server-context' }).use(httpError).decorate({
	// cat: cheshireCat, // FIXME: Fix RangeError: Maximum call stack size exceeded.
	mh: madHatter,
	rh: rabbitHole,
	log,
	db,
}).onBeforeHandle({ as: 'scoped' }, ({ headers, path, HttpError }) => {
	const apiKey = headers.token, realKey = parsedEnv.apiKey
	if (whitelistedPaths.some(p => path.startsWith(p))) return
	if (realKey && realKey !== apiKey)
		throw HttpError.Unauthorized('Invalid API key')
}).derive({ as: 'global' }, ({ headers }) => {
	const user = headers.user || 'user'
	return { stray: cat.getStray(user) || cat.addStray(user) }
}).model({
	generic: t.Record(t.String(), t.Any(), {
		examples: [{ key: 'value' }],
		$id: 'GenericObject',
		title: 'Generic Object',
		description: 'Generic key-value object',
	}),
	json: t.Union([jsonLiterals, t.Array(jsonLiterals), t.Record(t.String(), jsonLiterals)], {
		examples: [
			{ key: 'value' },
			['value'],
			'example',
			42,
		],
		$id: 'GenericJson',
		title: 'Generic JSON',
		description: 'Generic object representing all JSON possible values',
	}),
	customSetting: t.Object({
		name: t.String(),
		value: t.Any(),
	}, {
		examples: [{ name: 'key', value: 'value' }],
		$id: 'CustomSetting',
		title: 'Custom Setting',
		description: 'Custom setting for the cat',
	}),
	messageInput,
	memoryMessage,
	memoryRecall,
	modelInfo,
	pluginManifest,
	pluginInfo,
	pluginSettings,
	chatMessage,
	chatHistory: t.Object({
		history: t.Array(t.Ref('memoryMessage')),
	}, {
		$id: 'ChatHistory',
		title: 'Chat History',
		description: 'Chat messages history',
	}),
	modelsInfo: t.Object({
		selected: t.String(),
		options: t.Array(t.Ref('modelInfo')),
	}, {
		$id: 'ModelsInfo',
		title: 'Models Information',
		description: 'Information about available models and the selected model',
	}),
	pluginsInfo: t.Object({
		installed: t.Array(t.Ref('pluginInfo')),
		registry: t.Array(t.Pick(pluginInfo, ['id', 'manifest'])),
	}, {
		$id: 'PluginsInfo',
		title: 'Plugins Information',
		description: 'Information about installed and available plugins from registry',
	}),
	pluginsSettings: t.Object({
		settings: t.Array(t.Ref('pluginSettings')),
	}, {
		$id: 'PluginsSettings',
		title: 'Plugins Settings',
		description: 'Settings of all the installed plugins',
	}),
})
