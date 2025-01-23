#!/usr/bin/env bun

import type { App } from './main'
import { treaty } from '@elysiajs/eden'
import { type ArgsDef, defineCommand, runMain, showUsage } from 'citty'
import pkg from '~/package.json'
import { log } from './logger.ts'
import { catPaths } from './utils.ts'

const globalArgs = {
	token: {
		type: 'string',
		description: 'Authorization header token',
		required: false,
	},
	user: {
		type: 'string',
		description: 'User identifier header',
		required: false,
	},
} as const satisfies ArgsDef

const { hostname, port } = catPaths.realDomain

const cli = treaty<App>(`${hostname}:${port}`)

const main = defineCommand({
	meta: {
		name: 'ccat',
		description: 'A CLI for the Cheshire Cat API',
		version: pkg.version,
	},
	subCommands: {
		status: defineCommand({
			meta: {
				name: 'status',
				description: 'Check the status of the API',
			},
			args: globalArgs,
			async run({ args }) {
				const { token, user } = args
				const { data, error } = await cli.index.get({ headers: { token, user } })
				log.dir(data ?? error.value)
			},
		}),
		chat: defineCommand({
			meta: {
				name: 'chat',
				description: 'Chat with the Cheshire Cat',
			},
			args: {
				...globalArgs,
				text: {
					type: 'string',
					description: 'The text to send to the Cheshire Cat',
					valueHint: 'Hello world',
					required: true,
				},
				save: {
					type: 'boolean',
					description: 'Whether to save the message in the memory',
					default: true,
				},
				why: {
					type: 'boolean',
					description: 'Whether to include the reasoning in the response',
					default: true,
				},
			},
			async run({ args }) {
				const { token, user, text, save, why } = args
				const { data, error } = await cli.chat.post({
					text: String(text),
				}, {
					headers: { token, user },
					query: {
						save: !!save,
						why: !!why,
					},
				})
				log.dir(data ?? error.value)
			},
		}),
	},
	async run({ rawArgs }) {
		if (rawArgs.length === 0) await showUsage(main)
		process.exit(0)
	},
})

runMain(main)
