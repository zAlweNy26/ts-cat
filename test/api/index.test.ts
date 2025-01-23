import type { App } from '@/main'
import { treaty } from '@elysiajs/eden'
import { catPaths, parsedEnv } from '@utils'
import { describe, expect, it } from 'bun:test'
import pkg from '~/package.json'

const { hostname, port } = catPaths.realDomain

const api = treaty<App>(`${hostname}:${port}`)

describe('api status', () => {
	it('return correct response', async () => {
		const { data } = await api.index.get()

		expect(data).toBeObject()
		expect(data).toContainAllKeys(['status', 'version', 'protected'])
		expect(data).toContainAllValues(['We\'re all mad here, dear!', pkg.version, parsedEnv.apiKey !== undefined])
	})
})
