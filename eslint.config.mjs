import antfu from '@antfu/eslint-config'

export default antfu({
	stylistic: {
		indent: 'tab',
		quotes: 'single',
	},
	typescript: true,
	yaml: true,
	markdown: true,
	ignores: ['package.json', 'dist/', 'node_modules/', 'test/mocks/'],
	rules: {
		'unused-imports/no-unused-vars-ts': 'warn',
		'style/max-statements-per-line': 'off',
		'node/prefer-global/process': 'off',
		'curly': ['error', 'multi-line'],
		'no-console': 'off',
		'one-var': 'off',
	},
})
