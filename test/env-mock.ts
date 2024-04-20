import { afterAll, beforeAll, test, vi } from 'vitest'
import * as utils from '@utils'
import app from '@/app.ts'

export const appTest = test.extend({
	app,
	utils,
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
