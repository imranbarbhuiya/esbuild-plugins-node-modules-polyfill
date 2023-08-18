import esbuild, { type BuildOptions } from 'esbuild';

import { assertFileContent, buildAbsolutePath, createEsbuildConfig } from '../util';

import type { NodePolyfillsOptions } from '../../dist';

function createConfig(pluginOptions?: NodePolyfillsOptions): BuildOptions {
	return createEsbuildConfig(
		{
			format: 'iife',
			entryPoints: [buildAbsolutePath('./fixtures/input/fallbackUnpolyfilled.ts')],
		},
		pluginOptions,
	);
}

describe('Fallback Test (Unpolyfilled)', () => {
	test("GIVEN a file that imports a node builtin that isn't polyfilled THEN provide an empty fallback", async () => {
		const config = createConfig({
			fallback: 'empty',
		});

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/fallbackUnpolyfilled.js');
	});

	test("GIVEN a file that imports a node builtin when empty fallbacks aren't enabled THEN don't provide an empty fallback", async () => {
		const config = createConfig();

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/fallbackUnpolyfilled.js');
	});
});
