import { describe, expect, it } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { parsedEnv } from '@utils'
import pkg from '~/package.json'
import app from '@/main.ts'

const api = treaty(app)

describe('Api Status', () => {
	it('return correct response', async () => {
		const { data } = await api.index.get()

		expect(data).toBeObject()
		expect(data).toContainAllKeys(['status', 'version', 'protected'])
		expect(data).toContainAllValues(['We\'re all mad here, dear!', pkg.version, parsedEnv.apiKey !== undefined])
	})
})
