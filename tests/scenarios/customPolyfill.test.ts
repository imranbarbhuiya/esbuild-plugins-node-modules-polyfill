import esbuild, { type BuildOptions } from 'esbuild';

import { assertFileContent, buildAbsolutePath, createEsbuildConfig } from '../util';

import type { NodePolyfillsOptions } from '../../dist';

function createConfig(pluginOptions?: NodePolyfillsOptions): BuildOptions {
	return createEsbuildConfig(
		{
			format: 'iife',
			entryPoints: [buildAbsolutePath('./fixtures/input/customPolyfill/customPolyfill.ts')],
		},
		pluginOptions,
	);
}

describe('Custom Polyfill Override Test', () => {
	test('GIVEN a file that imports process with a custom override THEN use the custom polyfill', async () => {
		const customProcessPath = buildAbsolutePath('./fixtures/input/customPolyfill/customProcess.js');
		const config = createConfig({
			overrides: {
				process: customProcessPath,
			},
		});

		await esbuild.build(config);

		const result = await assertFileContent('./fixtures/output/customPolyfill.js');
		
		// The output should contain our custom process implementation
		expect(result).toContain('custom-v1.0.0');
		expect(result).toContain('Hello from custom process!');
	});

	test('GIVEN a file that imports process with node: prefix and custom override THEN use the custom polyfill', async () => {
		const customProcessPath = buildAbsolutePath('./fixtures/input/customPolyfill/customProcess.js');
		const config = createConfig({
			overrides: {
				'node:process': customProcessPath,
			},
		});

		await esbuild.build(config);

		const result = await assertFileContent('./fixtures/output/customPolyfill.js');
		
		// The output should contain our custom process implementation
		expect(result).toContain('custom-v1.0.0');
	});
});
