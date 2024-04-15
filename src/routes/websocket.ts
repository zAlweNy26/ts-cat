import type { FastifyPluginCallback } from 'fastify'
import { log } from '@logger'

export const websocket: FastifyPluginCallback = async (fastify) => {
	fastify.get<{
		Params: { userId?: string }
	}>('/:userId?', {
		websocket: true,
		schema: { hide: true },
	}, (connection, req) => {
		const userId = req.params.userId ?? 'user'
		if (req.stray.ws) {
			log.info(`User ${userId} already connected, closing the previous one...`)
			req.stray.ws.close()
		}
		req.stray.ws = connection.socket
	})
}
