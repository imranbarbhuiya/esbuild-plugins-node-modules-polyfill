import esbuild, { type BuildOptions } from 'esbuild';

import { assertFileContent, buildAbsolutePath, createEsbuildConfig } from '../util';

import type { NodePolyfillsOptions } from '../../dist';

function createConfig(pluginOptions?: NodePolyfillsOptions): BuildOptions {
	return createEsbuildConfig(
		{
			format: 'iife',
			entryPoints: [buildAbsolutePath('./fixtures/input/globalBuffer.ts')],
		},
		pluginOptions,
	);
}

describe('Global Buffer Test', () => {
	test('GIVEN a file that references the "Buffer" global THEN polyfill it', async () => {
		const config = createConfig({ globals: { Buffer: true } });
		await esbuild.build(config);
		await assertFileContent('./fixtures/output/globalBuffer.js');
	});

	test('GIVEN a file that references the "Buffer" global when the polyfill is disabled THEN ignore polyfill', async () => {
		const config = createConfig({ globals: { Buffer: false } });
		await esbuild.build(config);
		await assertFileContent('./fixtures/output/globalBuffer.js');
	});
});
