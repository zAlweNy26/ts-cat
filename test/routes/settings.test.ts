import { describe, expect } from 'vitest'
import { appTest } from '../env-mock.ts'

describe('settings routes', () => {
	appTest('GET /settings', async ({ app }) => {
		const res = await app.inject({
			method: 'GET',
			url: '/settings',
		})

		expect(res.statusCode).toBe(200)

		const keys = Object.keys(res.json())

		// Check if the default keys are present in the response.
		expect(keys.length).toBeGreaterThanOrEqual(8)
		expect(Object.keys(app.db.keys.shape).every(k => keys.includes(k))).toBe(true)
	})
})
