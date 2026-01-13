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
		rules: { 'unicorn/prefer-string-replace-all': 'off' },
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ['tsup.config.ts', 'vitest.config.ts', 'eslint.config.mjs'],
					defaultProject: 'tsconfig.eslint.json',
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{ ignores: ['.github', '.yarn', 'dist', 'node_modules', 'yarn.lock', 'tests/fixtures'] },
];
