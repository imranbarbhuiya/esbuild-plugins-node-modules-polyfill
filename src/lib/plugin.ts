import { builtinModules } from 'node:module';
import path from 'node:path';

import { loadPackageJSON } from 'local-pkg';

import { getCachedPolyfillContent, getCachedPolyfillPath } from './polyfill.js';
import { escapeRegex, commonJsTemplate, normalizeNodeBuiltinPath } from './utils/util.js';

import type { OnResolveArgs, OnResolveResult, Plugin } from 'esbuild';
import type esbuild from 'esbuild';

const NAME = 'node-modules-polyfills';

export interface NodePolyfillsOptions {
	fallback?: 'empty' | 'none';
	globals?: {
		Buffer?: boolean;
		process?: boolean;
	};
	modules?: string[] | Record<string, boolean | 'empty'>;
	name?: string;
	namespace?: string;
}

const loader = async (args: esbuild.OnLoadArgs): Promise<esbuild.OnLoadResult> => {
	try {
		const isCommonjs = args.namespace.endsWith('commonjs');

		const resolved = await getCachedPolyfillPath(args.path);
		const resolveDir = path.dirname(resolved);

		if (isCommonjs) {
			return {
				loader: 'js',
				contents: commonJsTemplate({
					importPath: args.path,
				}),
				resolveDir,
			};
		}

		const contents = await getCachedPolyfillContent(args.path);

		return {
			loader: 'js',
			contents,
			resolveDir,
		};
	} catch (error) {
		console.error('node-modules-polyfill', error);
		return {
			contents: `export {}`,
			loader: 'js',
		};
	}
};

export const nodeModulesPolyfillPlugin = (options: NodePolyfillsOptions = {}): Plugin => {
	const { globals = {}, modules: modulesOption = builtinModules, fallback, namespace = NAME, name = NAME } = options;
	if (namespace.endsWith('commonjs')) {
		throw new Error(`namespace ${namespace} must not end with commonjs`);
	}

	if (namespace.endsWith('empty')) {
		throw new Error(`namespace ${namespace} must not end with empty`);
	}

	const modules = Array.isArray(modulesOption)
		? Object.fromEntries(modulesOption.map((mod) => [mod, true]))
		: modulesOption;

	const commonjsNamespace = `${namespace}-commonjs`;
	const emptyNamespace = `${namespace}-empty`;

	return {
		name,
		setup: ({ onLoad, onResolve, initialOptions }) => {
			// polyfills contain global keyword, it must be defined
			if (initialOptions.define && !initialOptions.define.global) {
				initialOptions.define.global = 'globalThis';
			} else if (!initialOptions.define) {
				initialOptions.define = { global: 'globalThis' };
			}

			initialOptions.inject = initialOptions.inject ?? [];

			if (globals.Buffer) {
				initialOptions.inject.push(path.resolve(__dirname, '../globals/Buffer.js'));
			}

			if (globals.process) {
				initialOptions.inject.push(path.resolve(__dirname, '../globals/process.js'));
			}

			onLoad({ filter: /.*/, namespace: emptyNamespace }, () => {
				return {
					loader: 'js',
					// Use an empty CommonJS module here instead of ESM to avoid
					// "No matching export" errors in esbuild for anything that
					// is imported from this file.
					contents: 'module.exports = {}',
				};
			});

			onLoad({ filter: /.*/, namespace }, loader);
			onLoad({ filter: /.*/, namespace: commonjsNamespace }, loader);

			// If we are using empty fallbacks, we need to handle all builtin modules so that we can replace their contents,
			// otherwise we only need to handle the modules that are configured (which is everything by default)
			const bundledModules =
				fallback === 'empty'
					? builtinModules
					: Object.keys(modules).filter((moduleName) => builtinModules.includes(moduleName));

			const filter = new RegExp(`^(?:node:)?(?:${bundledModules.map(escapeRegex).join('|')})$`);

			const resolver = async (args: OnResolveArgs): Promise<OnResolveResult | undefined> => {
				const emptyResult = {
					namespace: emptyNamespace,
					path: args.path,
					sideEffects: false,
				};

				// https://github.com/defunctzombie/package-browser-field-spec
				if (initialOptions.platform === 'browser') {
					const packageJson = await loadPackageJSON(args.resolveDir);
					const browserFieldValue = packageJson?.browser?.[args.path];
					if (browserFieldValue !== undefined) {
						// If the module is disabled for browser builds, provide our standard empty module
						if (browserFieldValue === false) {
							return emptyResult;
						}

						// If it's an alias to another module for browser builds, skip resolving the polyfill
						if (typeof browserFieldValue === 'string') {
							return;
						}

						throw new Error(
							`The "browser" field in package.json (resolved from ${args.resolveDir}) must be a string or false, received ${browserFieldValue}`,
						);
					}
				}

				const moduleName = normalizeNodeBuiltinPath(args.path);

				const fallbackResult =
					fallback === 'empty'
						? emptyResult // Stub it out with an empty module
						: undefined; // Opt out of resolving it entirely so esbuild/other plugins can handle it

				if (!modules[moduleName]) {
					return fallbackResult;
				}

				if (modules[moduleName] === 'empty') {
					return emptyResult;
				}

				const polyfill = await getCachedPolyfillPath(moduleName).catch(() => null);

				if (!polyfill) {
					return fallbackResult;
				}

				const ignoreRequire = args.namespace === commonjsNamespace;
				const isCommonjs = !ignoreRequire && args.kind === 'require-call';

				return {
					namespace: isCommonjs ? commonjsNamespace : namespace,
					path: args.path,
					sideEffects: false,
				};
			};

			onResolve({ filter }, resolver);
		},
	};
};
