import { mockTest } from 'test/class-mocks.ts'
import { expect } from 'vitest'

mockTest('test main module', async () => {
	expect(1 + 1).toBe(2)

	/* expect(mh.installedPlugins.length).toBe(0)
	await mh.installPlugin('src/plugins/test_plugin')
	expect(mh.installedPlugins.length).toBe(1) */
})
