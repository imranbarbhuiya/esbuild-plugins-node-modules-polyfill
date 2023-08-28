import esbuild, { type BuildOptions } from 'esbuild';

import { assertFileContent, buildAbsolutePath, createEsbuildConfig } from '../util';

import type { NodePolyfillsOptions } from '../../dist';

function createConfig(pluginOptions?: NodePolyfillsOptions): BuildOptions {
	return createEsbuildConfig(
		{
			format: 'iife',
			entryPoints: [buildAbsolutePath('./fixtures/input/fallbackPolyfilled/fallbackPolyfilled.ts')],
		},
		pluginOptions,
	);
}

describe('Fallback Test (Polyfilled)', () => {
	test("GIVEN a file that imports a node builtin that isn't defined in the modules config THEN provide an empty fallback", async () => {
		const config = createConfig({
			fallback: 'empty',
			modules: ['constants'], // This ensures you can still polyfill other modules
		});

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/fallbackPolyfilled.js');
	});
});
