import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		name: 'src',
		environment: 'node',
		setupFiles: [
			'./test/class-mocks.ts',
			'./test/env-mock.ts',
		],
	},
})
