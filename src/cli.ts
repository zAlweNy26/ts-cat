import { treaty } from '@elysiajs/eden'
import { defineCommand, runMain, showUsage } from 'citty'
import pkg from '~/package.json'
import { log } from './logger.ts'
import app from './main'

const cli = treaty(app)

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
			async run() {
				const { data, error } = await cli.index.get()
				log.dir(data ?? error.value)
			},
		}),
		chat: defineCommand({
			meta: {
				name: 'chat',
				description: 'Chat with the Cheshire Cat',
			},
			args: {
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
				const { text, save, why } = args
				// TODO: Wait for citty to update the types
				const { data, error } = await cli.chat.post({
					text: String(text),
				}, {
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
		process.exit(1)
	},
})

runMain(main)
