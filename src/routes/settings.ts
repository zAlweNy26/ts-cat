import type { FastifyPluginCallback } from 'fastify'
import { z } from 'zod'
import { SwaggerTags, customSetting } from '@/context.ts'

export const settings: FastifyPluginCallback = async (fastify) => {
	fastify.get('/', { schema: {
		description: 'Get the entire list of settings available in the database.',
		tags: [SwaggerTags.Settings],
		summary: 'Get settings',
		response: {
			200: fastify.db.keys,
		},
	} }, () => {
		return fastify.db.data
	})

	fastify.get<{
		Params: { settingId: string }
	}>('/:settingId', { schema: {
		description: 'Get the a specific setting from the database.',
		tags: [SwaggerTags.Settings],
		summary: 'Get setting',
		params: z.object({
			settingId: z.string().min(1).trim(),
		}),
		response: {
			200: z.record(z.any()),
			404: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const db = fastify.db.data
		const key = Object.keys(db).find(k => k === req.params.settingId)
		if (!key) return rep.notFound('The passed Setting ID is not present in the database.')
		return {
			[key]: db[key],
		}
	})

	fastify.put<{
		Params: { settingId: string }
		Body: any
	}>('/:settingId', { schema: {
		description: 'Update a specific setting in the database if it exists.',
		tags: [SwaggerTags.Settings],
		summary: 'Update setting',
		body: z.any(),
		params: z.object({
			settingId: z.string().min(1).trim(),
		}),
		response: {
			200: z.record(z.any()),
			400: { $ref: 'HttpError' },
			404: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const db = fastify.db.data
		const key = Object.keys(db).find(k => k === req.params.settingId)
		if (!key) return rep.notFound('The passed Setting ID is not present in the database.')
		const parsed = fastify.db.parse({
			...db,
			[key]: req.body,
		})
		if (!parsed.success) return rep.badRequest(parsed.error.errors.join())
		fastify.db.update(db => db[key] = req.body)
		return {
			[key]: req.body,
		}
	})

	fastify.delete<{
		Params: { settingId: string }
	}>('/:settingId', { schema: {
		description: 'Delete a specific setting in the database.',
		tags: [SwaggerTags.Settings],
		params: z.object({
			settingId: z.string().min(1).trim(),
		}),
		summary: 'Delete setting',
		response: {
			200: z.record(z.any()),
			400: { $ref: 'HttpError' },
			404: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const db = fastify.db.data
		const key = Object.keys(db).find(k => k === req.params.settingId)
		if (!key) return rep.notFound('The passed Setting ID is not present in the database.')
		if (Object.keys(fastify.db.keys).includes(key)) return rep.badRequest('Cannot delete default settings.')
		const value = db[key]
		fastify.db.update(db => db[key] = undefined)
		return {
			[key]: value,
		}
	})

	fastify.post<{
		Body: z.output<typeof customSetting>
	}>('/', { schema: {
		description: 'Create a new setting in the database.',
		tags: [SwaggerTags.Settings],
		summary: 'Create setting',
		body: customSetting,
		response: {
			200: z.record(z.any()),
			400: { $ref: 'HttpError' },
		},
	} }, (req, rep) => {
		const { name, value } = req.body
		const db = fastify.db.data
		if (Object.keys(db).includes(name)) return rep.badRequest('Setting already exists.')
		fastify.db.update(db => db[name] = value)
		return {
			[name]: value,
		}
	})
}
