import antfu from '@antfu/eslint-config'
import oxlint from 'eslint-plugin-oxlint'

export default antfu({
	stylistic: {
		indent: 'tab',
		quotes: 'single',
	},
	typescript: true,
	yaml: true,
	markdown: true,
	ignores: ['package.json', 'dist/', 'node_modules/', 'test/mocks/', 'docs/api/**'],
	rules: {
		'unused-imports/no-unused-vars': 'warn',
		'style/max-statements-per-line': 'off',
		'regexp/no-unused-capturing-group': 'warn',
		'regexp/optimal-quantifier-concatenation': 'warn',
		'regexp/no-super-linear-backtracking': 'warn',
		'node/prefer-global/process': 'off',
		'curly': ['warn', 'multi-or-nest'],
		'antfu/curly': 'off',
		'antfu/no-top-level-await': 'off',
		'antfu/if-newline': 'off',
		'brace-style': 'off',
		'no-console': 'off',
		'one-var': 'off',
	},
}, [
	oxlint.configs['flat/recommended'],
])
