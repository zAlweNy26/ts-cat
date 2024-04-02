import { expect, it } from 'vitest'
import { catPaths, sleep, zodJsonType } from '@utils'

const isGithubAction = process.env.GITHUB_ACTIONS === 'true'

it.runIf(isGithubAction)('test cat paths', () => {
	expect(catPaths).toMatchObject({
		basePath: 'src',
		baseUrl: 'http://localhost:1865/',
		pluginsPath: 'src/plugins',
		assetsPath: 'src/assets',
		assetsUrl: 'http://localhost:1865/assets',
	})
})

it('test sleep', async () => {
	const start = Date.now()
	await sleep(100)
	expect(Date.now() - start).greaterThanOrEqual(95)
	expect(Date.now() - start).lessThanOrEqual(105)
})

it('test zod json type', () => {
	const json = { a: 1, b: '2' }

	expect(zodJsonType.parse(json)).toMatchObject(json)

	expect(zodJsonType.parse([1, 2, 3])).toMatchObject([1, 2, 3])

	expect(zodJsonType.parse('hello')).toBe('hello')

	expect(zodJsonType.parse(6)).toBe(6)

	expect(zodJsonType.parse(null)).toBe(null)

	expect(zodJsonType.parse(true)).toBe(true)
})
