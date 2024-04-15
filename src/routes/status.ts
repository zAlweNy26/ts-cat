import { z } from 'zod'
import type { FastifyPluginAsyncZodOpenApi } from 'fastify-zod-openapi'
import { parsedEnv } from '@utils'
import pkg from '../../package.json' assert { type: 'json' }
import { SwaggerTags } from '@/context.ts'

export const status: FastifyPluginAsyncZodOpenApi = async (fastify) => {
	fastify.get('/', { schema: {
		tags: [SwaggerTags.Status],
		summary: 'Get server status',
		description: 'Retrieve the current server status.',
		response: {
			200: z.object({
				status: z.string(),
				version: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/),
				protected: z.boolean(),
			}).openapi({ example: {
				status: 'We\'re all mad here, dear!',
				version: '1.0.0',
				protected: true,
			} }),
		},
	} }, () => {
		return {
			status: 'We\'re all mad here, dear!',
			version: pkg.version,
			protected: parsedEnv.apiKey !== undefined,
		}
	})
}
