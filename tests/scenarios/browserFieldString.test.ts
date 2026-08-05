import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

import esbuild, { type BuildOptions } from 'esbuild';

import { buildAbsolutePath, createEsbuildConfig } from '../util';

import type { NodePolyfillsOptions } from '../../dist';

function createConfig(pluginOptions?: NodePolyfillsOptions): BuildOptions {
	return createEsbuildConfig(
		{
			format: 'esm',
			entryPoints: [buildAbsolutePath('./fixtures/input/browserFieldString/browserFieldString.ts')],
			platform: 'browser',
			absWorkingDir: buildAbsolutePath('./fixtures/input/browserFieldString'),
		},
		pluginOptions,
	);
}

describe('Browser Field String Test', () => {
	test('GIVEN a package.json with a string browser field THEN still polyfill node builtins', async () => {
		const config = createConfig();

		await esbuild.build(config);

		const absolutePath = buildAbsolutePath('./fixtures/output/browserFieldString.js');
		expect(existsSync(absolutePath)).toBeTruthy();
		const result = await readFile(absolutePath, { encoding: 'utf-8' });
		expect(result.length).toBeGreaterThan(100);
		expect(result).toMatch(/inspect|util|path|join/);
	});
});
