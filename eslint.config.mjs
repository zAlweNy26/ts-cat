import zodOpenApi from 'eslint-plugin-zod-openapi'
import antfu from '@antfu/eslint-config'

export default antfu({
	stylistic: {
		indent: 'tab',
		quotes: 'single',
	},
	typescript: true,
	yaml: true,
	markdown: false, // TODO: Temporary fix until code blocks are correctly read
	ignores: ['package.json', 'dist/', 'node_modules/', 'test/mocks/'],
	plugins: {
		'zod-openapi': zodOpenApi,
	},
	rules: {
		// Error: You have used a rule which requires parserServices to be generated.
		// You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.
		/* 'zod-openapi/require-openapi': 'off',
		'zod-openapi/require-comment': 'off',
		'zod-openapi/require-example': 'off',
		'zod-openapi/prefer-zod-default': 'warn',
		'zod-openapi/prefer-openapi-last': 'warn', */
		'unused-imports/no-unused-vars-ts': 'warn',
		'style/max-statements-per-line': 'off',
		'regexp/no-unused-capturing-group': 'warn',
		'regexp/optimal-quantifier-concatenation': 'warn',
		'regexp/no-super-linear-backtracking': 'warn',
		'node/prefer-global/process': 'off',
		'curly': ['warn', 'multi-or-nest'],
		'antfu/curly': 'off',
		'antfu/if-newline': 'off',
		'brace-style': 'off',
		'no-console': 'off',
		'one-var': 'off',
	},
}, /* , {
	files: ['src/routes/*.ts'],
	rules: {
		'zod-openapi/require-openapi': 'error',
	},
} */)
