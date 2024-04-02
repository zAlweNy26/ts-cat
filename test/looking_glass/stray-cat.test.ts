import { mockTest } from 'test/env-mock.ts'
import { expect } from 'vitest'

mockTest('test main module', () => {
	expect(1 + 1).toBe(2)
})
