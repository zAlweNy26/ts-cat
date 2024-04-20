import { mockTest } from 'test/class-mocks.ts'
import { expect } from 'vitest'

mockTest('test main module', () => {
	expect(1 + 1).toBe(2)
	// expect(cat).toBeDefined()
})
