module.exports = {
	root: true,
	extends: ['expo', 'prettier'],
	plugins: ['prettier'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: false,
	},
	rules: {
		'prettier/prettier': 'error',
		'import/namespace': 'off',
		'import/no-unresolved': 'off',
		'@typescript-eslint/array-type': 'off',
	},
	ignorePatterns: ['dist/', '.eslintrc.cjs', 'node_modules/'],
}
