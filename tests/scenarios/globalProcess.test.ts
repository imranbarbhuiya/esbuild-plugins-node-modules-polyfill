import esbuild, { type BuildOptions } from 'esbuild';

import { assertFileContent, buildAbsolutePath, createEsbuildConfig } from '../util';

import type { NodePolyfillsOptions } from '../../dist';

function createConfig(pluginOptions?: NodePolyfillsOptions): BuildOptions {
	return createEsbuildConfig(
		{
			format: 'iife',
			entryPoints: [buildAbsolutePath('./fixtures/input/globalProcess.ts')],

			// Ensure that environment variables can still be injected via `define`
			define: { 'process.env.NODE_ENV': '"production"' },
		},
		pluginOptions,
	);
}

describe('Global Process Test', () => {
	test('GIVEN a file that references the "process" global THEN polyfill it', async () => {
		const config = createConfig({ globals: { process: true } });
		await esbuild.build(config);
		await assertFileContent('./fixtures/output/globalProcess.js');
	});

	test('GIVEN a file that references the "process" global when the polyfill is disabled THEN ignore polyfill', async () => {
		const config = createConfig({ globals: { process: false } });
		await esbuild.build(config);
		await assertFileContent('./fixtures/output/globalProcess.js');
	});
});
