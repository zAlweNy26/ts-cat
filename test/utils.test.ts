import { catUrls, zodJson } from '@utils'
import { isCI } from 'std-env'
import { expect, it } from 'vitest'

it.runIf(isCI)('cat paths', () => {
	expect(catUrls).toMatchObject({
		baseUrl: 'http://localhost:1865/',
		assetsUrl: 'http://localhost:1865/assets',
	})
})

it('zod json type', () => {
	const json = { a: 1, b: '2' }

	expect(zodJson.parse(json)).toMatchObject(json)

	expect(zodJson.parse([1, 2, 3])).toMatchObject([1, 2, 3])

	expect(zodJson.parse('hello')).toBe('hello')

	expect(zodJson.parse(6)).toBe(6)

	expect(zodJson.parse(null)).toBe(null)

	expect(zodJson.parse(true)).toBe(true)
})
