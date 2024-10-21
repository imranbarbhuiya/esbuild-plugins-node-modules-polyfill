import common from 'eslint-config-mahir/common';
import node from 'eslint-config-mahir/node';
import typescript from 'eslint-config-mahir/typescript';

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
export default [
	...common,
	...node,
	...typescript,
	{
		ignores: ['.github', '.yarn', 'dist'],
		rules: {
			'unicorn/prefer-string-replace-all': 'off',
		},
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ['eslint.config.mjs', 'tsup.config.ts', 'vitest.config.ts', 'eslint.config.mjs'],
					defaultProject: 'tsconfig.eslint.json',
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
];
