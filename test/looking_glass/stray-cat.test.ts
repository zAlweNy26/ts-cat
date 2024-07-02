import { mockTest } from 'test/env-mock.ts'
import { expect } from 'vitest'

mockTest('main module', (/* { strayCat: stray } */) => {
	expect(1 + 1).toBe(2)
	/* expect(stray.userId).toBe('Alice')
	expect(stray.ws).toBe(undefined)
	stray.send({ type: 'notification', content: 'Test notification' })
	expect(stray.wsQueue.length).toEqual(1) */
})
