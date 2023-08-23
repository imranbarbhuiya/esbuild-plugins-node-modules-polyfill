import esbuild, { type BuildOptions, type Platform } from 'esbuild';

import { assertFileContent, buildAbsolutePath, createEsbuildConfig } from '../util';

import type { NodePolyfillsOptions } from '../../dist';

function createConfig(platform: Platform, pluginOptions?: NodePolyfillsOptions): BuildOptions {
	return createEsbuildConfig(
		{
			format: 'iife',
			entryPoints: [buildAbsolutePath('./fixtures/input/browserFieldFalse/browserFieldFalse.ts')],
			platform,
		},
		pluginOptions,
	);
}

describe('Browser Field False Test', () => {
	test("GIVEN a file in a browser target build that imports a node builtin with its browser field value set to 'false' THEN don't provide the polyfill", async () => {
		const config = createConfig('browser');

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/browserFieldFalse.js');
	});

	test("GIVEN a file in a node target build that imports a node builtin with its browser field value set to 'false' THEN still provide the polyfill", async () => {
		const config = createConfig('node');

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/browserFieldFalse.js');
	});

	test("GIVEN a file in a neutral target build that imports a node builtin with its browser field value set to 'false' THEN still provide the polyfill", async () => {
		const config = createConfig('neutral');

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/browserFieldFalse.js');
	});
});
