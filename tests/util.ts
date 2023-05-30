import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { nodeModulesPolyfillPlugin, type NodePolyfillsOptions } from '../dist/index.js';

import type { BuildOptions } from 'esbuild';

export function createEsbuildConfig(
	buildOptions: BuildOptions,
	nodePolyfillsOptions?: NodePolyfillsOptions,
): BuildOptions {
	return {
		...buildOptions,
		outdir: buildAbsolutePath('./fixtures/output'),
		bundle: true,
		platform: 'node',
		plugins: [nodeModulesPolyfillPlugin(nodePolyfillsOptions)],
	};
}

export async function assertFileContent(filePath: string) {
	const absolutePath = buildAbsolutePath(filePath);
	expect(existsSync(absolutePath)).toBeTruthy();
	const result = await readFile(absolutePath, { encoding: `utf-8` });

	expect(result).toMatchSnapshot();

	return result;
}

export function buildAbsolutePath(filePath: string) {
	return resolve(__dirname, filePath);
}
