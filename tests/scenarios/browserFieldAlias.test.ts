import esbuild, { type BuildOptions } from 'esbuild';

import { assertFileContent, buildAbsolutePath, createEsbuildConfig } from '../util';

import type { NodePolyfillsOptions } from '../../dist';

function createConfig(platform: esbuild.Platform, pluginOptions?: NodePolyfillsOptions): BuildOptions {
	return createEsbuildConfig(
		{
			format: 'iife',
			entryPoints: [buildAbsolutePath('./fixtures/input/browserFieldAlias/browserFieldAlias.ts')],
			platform,
		},
		pluginOptions,
	);
}

describe('Browser Field Alias Test', () => {
	test('GIVEN a file in a browser platform build that imports a node builtin with its browser field value set to another file THEN the output should contain the other file', async () => {
		const config = createConfig('browser');

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/browserFieldAlias.js');
	});

	test('GIVEN a file in a node platform build that imports a node builtin with its browser field value set to another file THEN still provide the polyfill', async () => {
		const config = createConfig('node');

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/browserFieldAlias.js');
	});

	test('GIVEN a file in a neutral platform build that imports a node builtin with its browser field value set to another file THEN still provide the polyfill', async () => {
		const config = createConfig('neutral');

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/browserFieldAlias.js');
	});
});
