import { serverContext, swaggerTags } from '@/context'
import { Elysia, t } from 'elysia'

export const settingsRoutes = new Elysia({
	name: 'settings',
	prefix: '/settings',
	detail: { tags: [swaggerTags.settings.name] },
}).use(serverContext).get('/', ({ db }) => db.data, {
	detail: {
		description: 'Get the entire list of settings available in the database.',
		summary: 'Get settings',
	},
	response: {
		200: 'generic',
		400: 'error',
	},
}).get('/:settingId', ({ db, params, HttpError }) => {
	const id = params.settingId
	const key = Object.keys(db.data).find(k => k === id)
	if (!key) throw HttpError.NotFound(`The passed setting key '${id}' is not present in the database.`)
	return { [key]: db.data[key] }
}, {
	params: t.Object({ settingId: t.String() }),
	detail: {
		description: 'Get the a specific setting from the database.',
		summary: 'Get setting',
	},
	response: {
		200: 'generic',
		400: 'error',
	},
}).put('/:settingId', ({ db, params, body, HttpError }) => {
	const id = params.settingId
	const key = Object.keys(db.data).find(k => k === id)
	if (!key) throw HttpError.NotFound(`The passed setting key '${id}' is not present in the database.`)
	const parsed = db.parse({
		...db.data,
		[key]: body,
	})
	if (!parsed.success) throw HttpError.InternalServer(parsed.error.errors.map(e => e.message).join())
	db.update(db => db[key] = body)
	return {
		[key]: body,
	}
}, {
	params: t.Object({ settingId: t.String() }),
	body: 'json',
	detail: {
		description: 'Update a specific setting in the database if it exists.',
		summary: 'Update setting',
	},
	response: {
		200: 'generic',
		400: 'error',
		404: 'error',
	},
}).post('/:settingId', ({ db, params, body, HttpError }) => {
	const id = params.settingId
	if (Object.keys(db.data).includes(id)) HttpError.BadRequest('Setting already exists.')
	db.update(db => db[id] = body)
	return {
		[id]: body,
	}
}, {
	params: t.Object({ settingId: t.String() }),
	body: 'json',
	detail: {
		description: 'Create a new setting in the database.',
		summary: 'Create setting',
	},
	response: {
		200: 'generic',
		400: 'error',
	},
}).delete('/:settingId', ({ db, params, HttpError }) => {
	const id = params.settingId
	const key = Object.keys(db).find(k => k === id)
	if (!key) throw HttpError.NotFound(`The passed setting key '${id}' is not present in the database.`)
	if (Object.keys(db.keys).includes(key)) throw HttpError.BadRequest('Cannot delete default settings.')
	const value = db.data[key]
	db.update(db => db[key] = undefined)
	return {
		[key]: value,
	}
}, {
	params: t.Object({ settingId: t.String() }),
	detail: {
		description: 'Delete a specific setting from the database.',
		summary: 'Delete setting',
	},
	response: {
		200: 'generic',
		400: 'error',
		404: 'error',
	},
})
