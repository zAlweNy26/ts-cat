import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		name: 'src',
		environment: 'node',
		setupFiles: ['./test/env-mock.ts'],
	},
})
