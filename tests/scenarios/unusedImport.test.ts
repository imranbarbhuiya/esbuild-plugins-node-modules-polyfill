import esbuild, { type BuildOptions } from 'esbuild';

import { assertFileContent, buildAbsolutePath, createEsbuildConfig } from '../util';

import type { NodePolyfillsOptions } from '../../dist';

function createConfig(pluginOptions?: NodePolyfillsOptions): BuildOptions {
	return createEsbuildConfig(
		{
			format: 'esm',
			entryPoints: [buildAbsolutePath('./fixtures/input/unusedImport.ts')],
		},
		pluginOptions,
	);
}

describe('Unused Import Test', () => {
	test('GIVEN a file that imports from a module exporting a node builtin and does not use it THEN it should be removed by esbuild', async () => {
		const config = createConfig();

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/unusedImport.js');
	});
});
