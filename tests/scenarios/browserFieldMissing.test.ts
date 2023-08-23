import esbuild, { type BuildOptions } from 'esbuild';

import { assertFileContent, buildAbsolutePath, createEsbuildConfig } from '../util';

import type { NodePolyfillsOptions } from '../../dist';

function createConfig(pluginOptions?: NodePolyfillsOptions): BuildOptions {
	return createEsbuildConfig(
		{
			format: 'iife',
			entryPoints: [buildAbsolutePath('./fixtures/input/browserFieldMissing/browserFieldMissing.ts')],
			platform: 'browser',
		},
		pluginOptions,
	);
}

describe('Browser Field Missing Test', () => {
	test('GIVEN a file in a browser target build that imports a node builtin without a browser field THEN provide the polyfill', async () => {
		const config = createConfig();

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/browserFieldMissing.js');
	});
});
