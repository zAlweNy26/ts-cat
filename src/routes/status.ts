import type { FastifyPluginCallback } from 'fastify'
import { parsedEnv } from '@utils'
import pkg from '../../package.json' assert { type: 'json' }

export const status: FastifyPluginCallback = (fastify, opts, done) => {
	fastify.get('/', { schema: {
		description: 'Retrieve the current server status.',
		tags: ['Status'],
		summary: 'Get server status',
		response: {
			200: {
				type: 'object',
				required: ['status', 'version', 'protected'],
				properties: {
					status: { type: 'string' },
					version: { type: 'string' },
					protected: { type: 'boolean' },
				},
			},
		},
	} }, () => {
		return {
			status: 'We\'re all mad here, dear!',
			version: pkg.version,
			protected: parsedEnv.apiKey !== undefined,
		}
	})

	done()
}
