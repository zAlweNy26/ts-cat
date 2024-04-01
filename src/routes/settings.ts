import type { FastifyPluginCallback } from 'fastify'
import { getDb, updateDb } from '@db'

export const settings: FastifyPluginCallback = (fastify, opts, done) => {
	fastify.get('/', { schema: {
		description: 'Get the entire list of settings available in the database.',
		tags: ['Settings'],
		summary: 'Get settings',
		response: {
			200: { type: 'object', additionalProperties: true },
		},
	} }, () => {
		return getDb()
	})

	fastify.get<{
		Params: { settingId: string }
	}>('/:settingId', { schema: {
		description: 'Get the a specific setting from the database.',
		tags: ['Settings'],
		summary: 'Get setting',
		response: {
			200: { type: 'object', additionalProperties: true },
			404: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const db = getDb()
		const key = Object.keys(db).find(k => k === req.params.settingId)
		if (!key) { return rep.notFound('The passed Setting ID is not present in the database.') }
		return {
			[key]: db[key],
		}
	})

	fastify.put<{
		Params: { settingId: string }
		Body: Record<string, any>
	}>('/:settingId', { schema: {
		description: 'Update a specific setting in the database if it exists.',
		tags: ['Settings'],
		summary: 'Update setting',
		body: {
			anyOf: [
				{ type: 'object', additionalProperties: true },
				{ type: 'boolean' },
				{ type: 'array' },
				{ type: 'string' },
				{ type: 'number' },
			],
		},
		response: {
			200: { type: 'object', additionalProperties: true },
			404: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const key = Object.keys(getDb()).find(k => k === req.params.settingId)
		if (!key) { return rep.notFound('The passed Setting ID is not present in the database.') }
		updateDb(db => db[key] = req.body)
		return {
			[key]: req.body,
		}
	})

	fastify.delete<{
		Params: { settingId: string }
	}>('/:settingId', { schema: {
		description: 'Delete a specific setting in the database.',
		tags: ['Settings'],
		summary: 'Delete setting',
		response: {
			200: { type: 'object', additionalProperties: true },
			404: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const key = Object.keys(getDb()).find(k => k === req.params.settingId)
		if (!key) { return rep.notFound('The passed Setting ID is not present in the database.') }
		const value = getDb()[key]
		updateDb(db => db[key] = undefined)
		return {
			[key]: value,
		}
	})

	fastify.post<{
		Body: {
			name: string
			value: Record<string, any>
		}
	}>('/', { schema: {
		description: 'Create a new setting in the database.',
		tags: ['Settings'],
		summary: 'Create setting',
		body: { $ref: 'Setting' },
		response: {
			200: { type: 'object', additionalProperties: true },
		},
	} }, (req) => {
		const { name, value } = req.body
		updateDb(db => db[name] = value)
		return {
			[name]: value,
		}
	})

	done()
}
