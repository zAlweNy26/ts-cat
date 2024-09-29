import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		name: 'CheshireCat',
		environment: 'node',
		setupFiles: ['./test/env-mock.ts'],
	},
})
