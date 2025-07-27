import { cheshireCat, StrayCat, StrayKitten } from '@lg'
import { afterAll, beforeAll, test, vi } from 'vitest'
import { v4 as uuidv4 } from 'uuid'

export const mockTest = test.extend({
	cheshireCat,
	strayCat: new StrayCat('alice'),
	strayKitten: new StrayKitten('alice', uuidv4()),
})

beforeAll(() => {
	vi.stubEnv('CORE_HOST', 'localhost')
	vi.stubEnv('CORE_PORT', '1865')
	vi.stubEnv('CORE_USE_SECURE_PROTOCOLS', 'false')
	vi.stubEnv('QDRANT_HOST', 'localhost')
	vi.stubEnv('QDRANT_PORT', '6333')
})

afterAll(() => {
	vi.unstubAllEnvs()
})
