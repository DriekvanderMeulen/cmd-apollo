const prettierConfig = require('./prettier.config.cjs')

module.exports = {
	root: true,
	extends: ['expo', 'plugin:@typescript-eslint/recommended', 'prettier'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		tsconfigRootDir: __dirname,
		project: './tsconfig.json',
	},
	plugins: ['@typescript-eslint', 'prettier'],
	rules: {
		'prettier/prettier': ['error', prettierConfig],
		'@typescript-eslint/explicit-function-return-type': 'off',
		'react/jsx-props-no-spreading': 'off',
	},
}

