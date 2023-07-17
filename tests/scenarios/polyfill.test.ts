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

	test('GIVEN a file that imports a node builtin and opts into polyfill THEN polyfill it', async () => {
		const config = createConfig({
			modules: ['util'],
		});

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/polyfill.js');
	});

	test('GIVEN a file that imports a node builtin and opts into an empty polyfill THEN provide an empty module', async () => {
		const config = createConfig({
			modules: { util: 'empty' },
		});

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/polyfill.js');
	});

	test("GIVEN a file that imports a node builtin and doesn't opt into polyfill THEN don't polyfill it", async () => {
		const config = createConfig({
			modules: [],
		});

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/polyfill.js');
	});

	test("GIVEN a file that imports a node builtin and explicitly opts out of polyfill THEN don't polyfill it", async () => {
		const config = createConfig({
			modules: { util: false },
		});

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/polyfill.js');
	});
});
