/* eslint-disable import/extensions */
import esbuild, { type BuildOptions } from 'esbuild';

import { assertFileContent, buildAbsolutePath, createEsbuildConfig } from '../util';

import type { NodePolyfillsOptions } from '../../dist';

function createConfig(pluginOptions?: NodePolyfillsOptions): BuildOptions {
	return createEsbuildConfig(
		{
			format: 'iife',
			entryPoints: [buildAbsolutePath('./fixtures/input/file.ts')],
		},
		pluginOptions,
	);
}

describe('Polyfill Test', () => {
	test('GIVEN a file that imports a node builtin file THEN polyfill it', async () => {
		const config = createConfig();

		await esbuild.build(config);

		await assertFileContent('./fixtures/output/file.js');
	});

	// TODO: new file
	// test('GIVEN a file that imports a node builtin with node: prefix file THEN polyfill it', async () => {
	// 	const config = createConfig();

	// 	await esbuild.build(config);

	// 	await assertFileContent('../fixtures/output/file.js');
	// });

	// test("GIVEN a file that imports a node builtin file in cjs format THEN don't polyfill it", async () => {
	// 	const config = createConfig({
	// 		format: 'cjs',
	// 	});

	// 	await esbuild.build(config);

	// 	await assertFileContent('../fixtures/output/file.js');
	// });

	// test("GIVEN a file that imports a node builtin file in esm format THEN don't polyfill it", async () => {
	// 	const config = createConfig({
	// 		format: 'esm',
	// 	});

	// 	await esbuild.build(config);

	// 	await assertFileContent('../fixtures/output/file.js');
	// });
});
