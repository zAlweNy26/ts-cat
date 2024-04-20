import { describe, expect } from 'vitest'
import pkg from '../../package.json' assert { type: 'json' }
import { appTest } from '../env-mock.ts'

describe('status routes', () => {
	appTest('GET /', async ({ app }) => {
		const res = await app.inject({
			method: 'GET',
			url: '/',
		})

		expect(res.statusCode).toBe(200)

		expect(res.json()).toEqual({
			status: 'We\'re all mad here, dear!',
			version: pkg.version,
			protected: process.env.API_KEY !== undefined,
		})
	})
})
