import esbuild, { type BuildOptions } from 'esbuild';

import { assertFileContent, buildAbsolutePath, createEsbuildConfig } from '../util';

import type { NodePolyfillsOptions } from '../../dist';

function createConfig(pluginOptions?: NodePolyfillsOptions): BuildOptions {
	return createEsbuildConfig(
		{
			format: 'iife',
			entryPoints: [buildAbsolutePath('./fixtures/input/polyfill.ts')],
		},
		pluginOptions,
	);
}

describe('Polyfill Test', () => {
	test('GIVEN a file that imports a node builtin THEN polyfill it', async () => {
		const config = createConfig();

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/polyfill.js');
	});
});
