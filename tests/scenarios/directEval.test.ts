import esbuild, { type BuildOptions } from 'esbuild';

import { assertFileContent, buildAbsolutePath, createEsbuildConfig } from '../util';

import type { NodePolyfillsOptions } from '../../dist';

function createConfig(pluginOptions?: NodePolyfillsOptions): BuildOptions {
	return createEsbuildConfig(
		{
			format: 'iife',
			entryPoints: [buildAbsolutePath('./fixtures/input/directEval.ts')],
		},
		pluginOptions,
	);
}

describe('Direct Eval Test', () => {
	test("GIVEN a file that imports a crypto THEN the output shouldn't contain direct eval", async () => {
		const config = createConfig();

		await esbuild.build(config);

		const result = await assertFileContent('./fixtures/output/directEval.js');

		expect(result).not.toContain('eval(');
	});
});
