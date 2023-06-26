import { builtinModules } from 'node:module';
import { resolve, join } from 'node:path';

import { build } from 'esbuild';
import { loadPackageJSON, resolveModule } from 'local-pkg';
import { resolve as resolveExports } from 'resolve.exports';

import { normalizeNodeBuiltinPath } from './utils/util.js';

async function polyfillPath(importPath: string) {
	if (!builtinModules.includes(importPath))
		throw new Error(`Node.js does not have ${importPath} in its builtin modules`);

	const jspmPath = resolve(
		require.resolve(`@jspm/core/nodelibs/${importPath}`),
		// ensure "fs/promises" is resolved properly
		'../../..' + (importPath.includes('/') ? '/..' : ''),
	);

	const jspmPackageJson = await loadPackageJSON(jspmPath);
	const exportPath = resolveExports(jspmPackageJson, `./nodelibs/${importPath}`, {
		browser: true,
	});

	const exportFullPath = resolveModule(join(jspmPath, exportPath?.[0] ?? ''));

	if (!exportPath || !exportFullPath) {
		throw new Error(
			'resolving failed, please try creating an issue in https://github.com/imranbarbhuiya/esbuild-plugins-node-modules-polyfill',
		);
	}

	return exportFullPath;
}

const polyfillPathCache: Map<string, Promise<string>> = new Map();
export const getCachedPolyfillPath = (importPath: string): Promise<string> => {
	const normalizedImportPath = normalizeNodeBuiltinPath(importPath);

	const cachedPromise = polyfillPathCache.get(normalizedImportPath);
	if (cachedPromise) {
		return cachedPromise;
	}

	const promise = polyfillPath(normalizedImportPath);
	polyfillPathCache.set(normalizedImportPath, promise);
	return promise;
};

export const polyfillContentAndTransform = async (importPath: string) => {
	const exportFullPath = await getCachedPolyfillPath(importPath);

	const content = (
		await build({
			write: false,
			format: 'esm',
			bundle: true,
			entryPoints: [exportFullPath],
		})
	).outputFiles[0]!.text;

	return content.replace(/eval\(/g, '(0,eval)(');
};

const polyfillContentCache: Map<string, Promise<string>> = new Map();
export const getCachedPolyfillContent = (_importPath: string): Promise<string> => {
	const normalizedImportPath = normalizeNodeBuiltinPath(_importPath);

	const cachedPromise = polyfillContentCache.get(normalizedImportPath);
	if (cachedPromise) {
		return cachedPromise;
	}

	const promise = polyfillContentAndTransform(normalizedImportPath);
	polyfillContentCache.set(normalizedImportPath, promise);
	return promise;
};
