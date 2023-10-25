import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		name: 'src',
		environment: 'node',
		coverage: {
			include: ['src/**/*.ts'],
		},
	},
})
