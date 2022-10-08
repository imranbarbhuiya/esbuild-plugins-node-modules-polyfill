import { builtinModules } from 'node:module';
import path from 'node:path';

import { polyfillContent, polyfillPath } from 'modern-node-polyfills';

import { escapeRegex, commonJsTemplate, removeEndingSlash } from './utils/util.js';

import type { OnResolveArgs, Plugin } from 'esbuild';
import type esbuild from 'esbuild';

const NAME = 'node-modules-polyfills';

export interface NodePolyfillsOptions {
	name?: string;
	namespace?: string;
}

const loader = async (args: esbuild.OnLoadArgs): Promise<esbuild.OnLoadResult> => {
	try {
		const isCommonjs = args.namespace.endsWith('commonjs');

		const resolved = await polyfillPath(removeEndingSlash(args.path));
		const contents = await polyfillContent(removeEndingSlash(args.path));
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
	const { namespace = NAME, name = NAME } = options;
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

			onLoad({ filter: /.*/, namespace }, loader);
			onLoad({ filter: /.*/, namespace: commonjsNamespace }, loader);
			const filter = new RegExp(`(?:node:)?${builtinModules.map(escapeRegex).join('|')}`);
			const resolver = async (args: OnResolveArgs) => {
				const ignoreRequire = args.namespace === commonjsNamespace;

				const pollyfill = await polyfillPath(args.path).catch(() => null);

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
