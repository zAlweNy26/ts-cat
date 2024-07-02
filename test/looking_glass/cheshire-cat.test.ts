import { mockTest } from 'test/env-mock.ts'
import { expect } from 'vitest'

mockTest('main module', () => {
	expect(1 + 1).toBe(2)
})
