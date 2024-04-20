import { madHatter } from '@mh/mad-hatter.ts'
import { cheshireCat } from '@lg/cheshire-cat.ts'
import { StrayCat } from '@lg/stray-cat.ts'
import { rabbitHole } from '@rh'
import * as utils from '@utils'
import { test, vi } from 'vitest'

export const mockTest = test.extend({
	/* madHatter,
	cheshireCat,
	rabbitHole,
	strayCat: new StrayCat('Alice'), */
	utils,
})

/* vi.mock('@plugin', async (importOriginal) => {
	const mod = await importOriginal<typeof import('@plugin')>()
	mod.Plugin.prototype.reload = vi.fn()
	return mod
}) */

vi.mock('@mh/mad-hatter.ts', async (importOriginal) => {
	const mod = await importOriginal<typeof import('@mh/mad-hatter.ts')>()
	mod.MadHatter.prototype.findPlugins = vi.fn()
	return mod
})
