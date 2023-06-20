import { builtinModules } from 'node:module';
import path from 'node:path';

import { getCachedPolyfillContent, getCachedPolyfillPath } from './polyfill.js';
import { escapeRegex, commonJsTemplate } from './utils/util.js';

import type { OnResolveArgs, Plugin } from 'esbuild';
import type esbuild from 'esbuild';

const NAME = 'node-modules-polyfills';

export interface NodePolyfillsOptions {
	globals?: {
		Buffer?: boolean;
		process?: boolean;
	};
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
	const { globals = {}, namespace = NAME, name = NAME } = options;
	if (namespace.endsWith('commonjs')) {
		throw new Error(`namespace ${namespace} must not end with commonjs`);
	}

	const commonjsNamespace = `${namespace}-commonjs`;

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

			onLoad({ filter: /.*/, namespace }, loader);
			onLoad({ filter: /.*/, namespace: commonjsNamespace }, loader);
			const filter = new RegExp(`(?:node:)?${builtinModules.map(escapeRegex).join('|')}`);
			const resolver = async (args: OnResolveArgs) => {
				const ignoreRequire = args.namespace === commonjsNamespace;

				const pollyfill = await getCachedPolyfillPath(args.path).catch(() => null);

				if (!pollyfill) {
					return;
				}

				const isCommonjs = !ignoreRequire && args.kind === 'require-call';

				return {
					namespace: isCommonjs ? commonjsNamespace : namespace,
					path: args.path,
				};
			};

			onResolve({ filter }, resolver);
		},
	};
};
