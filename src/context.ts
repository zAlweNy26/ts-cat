import { Buffer } from 'node:buffer'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { extendZodWithOpenApi } from 'zod-openapi'

extendZodWithOpenApi(z)

export enum SwaggerTags {
	'Status' = 'Status',
	'Settings' = 'Settings',
	'Large Language Model' = 'LLM',
	'Embedder' = 'Embedder',
	'Plugins' = 'Plugins',
	'Rabbit Hole' = 'RabbitHole',
	'Memory' = 'Memory',
}

export const fileSchema = z.string().refine(s => Buffer.isBuffer(Buffer.from(s))).openapi({ format: 'binary' })

export const pluginManifestSchema = z.object({
	name: z.string().min(1).trim(),
	version: z.string().trim().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/).default('0.0.1'),
	description: z.string().min(1).trim().default('No description provided'),
	authorName: z.string().min(1).trim().default('Anonymous'),
	authorUrl: z.string().trim().url().optional(),
	pluginUrl: z.string().trim().url().optional(),
	thumb: z.string().trim().url().optional(),
	tags: z.array(z.string().trim()).default(['miscellaneous', 'unknown']),
})

export const modelInfo = z.object({
	name: z.string(),
	humanReadableName: z.string(),
	description: z.string(),
	link: z.string().url(),
	schema: z.record(z.any()),
	value: z.record(z.any()),
}).openapi({
	ref: 'ModelInfo',
	description: 'Information about a model',
	example: {
		name: 'ChatOpenAILLM',
		humanReadableName: 'OpenAI ChatGPT',
		description: 'Chat model from OpenAI',
		link: 'https://platform.openai.com/docs/models/overview',
		schema: zodToJsonSchema(z.object({
			apiKey: z.string(),
			model: z.string(),
			temperature: z.number(),
			streaming: z.boolean(),
		})),
		value: {
			apiKey: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
			model: 'gpt-3.5-turbo-instruct',
			temperature: 0.7,
			streaming: false,
		},
	},
})

export const customSetting = z.object({
	name: z.string(),
	value: z.any(),
}).openapi({
	ref: 'Setting',
	description: 'Custom database setting',
	examples: [
		{
			name: 'Custom setting 1',
			value: {
				myKey1: 'test',
				myKey2: 69,
			},
		},
		{
			name: 'Custom setting 2',
			value: 'example',
		},
		{
			name: 'Custom setting 3',
			value: 42,
		},
	],
})

export const pluginSettings = z.object({
	name: z.string(),
	schema: z.record(z.any()),
	value: z.record(z.any()),
}).openapi({
	ref: 'PluginSettings',
	description: 'Plugin settings',
	example: {
		name: 'Plugin Id',
		schema: zodToJsonSchema(z.object({
			myKey1: z.string(),
			myKey2: z.number(),
		})),
		value: {
			myKey1: 'test',
			myKey2: 6,
		},
	},
})

export const pluginInfo = z.object({
	id: z.string(),
	active: z.boolean(),
	upgradable: z.boolean(),
	manifest: pluginManifestSchema,
	forms: z.object({
		name: z.string(),
		description: z.string(),
		active: z.boolean(),
	}),
	tools: z.object({
		name: z.string(),
		description: z.string(),
		active: z.boolean(),
	}),
	hooks: z.object({
		name: z.string(),
		priority: z.number(),
	}),
}).openapi({
	ref: 'PluginInfo',
	description: 'Information about a plugin',
	example: {
		id: 'plugin-id',
		active: true,
		upgradable: false,
		manifest: {
			name: 'Plugin Name',
			version: '0.0.1',
			description: 'Plugin description',
			authorName: 'Author Name',
			authorUrl: 'https://author.url',
			pluginUrl: 'https://plugin.url',
			thumb: 'https://thumb.url',
			tags: ['tag1', 'tag2'],
		},
		forms: {
			name: 'Form Name',
			description: 'Form description',
			active: true,
		},
		tools: {
			name: 'Tool Name',
			description: 'Tool description',
			active: true,
		},
		hooks: {
			name: 'Hook Name',
			priority: 1,
		},
	},
})
