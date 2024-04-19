import { madHatter } from '@mh/mad-hatter.ts'
import { cheshireCat } from '@lg/cheshire-cat.ts'
import { StrayCat } from '@lg/stray-cat.ts'
import { rabbitHole } from '@rh'
import { afterAll, beforeAll, test, vi } from 'vitest'
import app from '@/main.ts'

export const mockTest = test.extend({
	/* cheshireCat,
	madHatter,
	rabbitHole,
	strayCat: new StrayCat('Alice'), */
})

export const appTest = test.extend({
	app,
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
