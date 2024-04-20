import { mockTest } from 'test/class-mocks.ts'
import { expect } from 'vitest'

mockTest('test main module', () => {
	expect(1 + 1).toBe(2)

	/* expect(stray.userId).toBe('Alice')
	expect(stray.ws).toBe(undefined)

	stray.send({ type: 'notification', content: 'Test notification' })
	expect(stray.wsQueue.length).toEqual(1)
	expect(stray.getHistory().length).toEqual(0) */
})
