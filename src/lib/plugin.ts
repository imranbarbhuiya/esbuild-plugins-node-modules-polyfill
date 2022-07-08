import fs from 'node:fs';
import path from 'node:path';
import type { OnResolveArgs, Plugin } from 'esbuild';
import type esbuild from 'esbuild';
import { getModules as builtinsPolyfills } from 'rollup-plugin-polyfill-node/dist/modules.js';
import { escapeRegex, commonJsTemplate, removeEndingSlash } from './utils/util';

const NAME = 'node-modules-polyfills';

export interface NodePolyfillsOptions {
	name?: string;
	namespace?: string;
}

export const nodeModulesPolyfillPlugin = (options: NodePolyfillsOptions = {}): Plugin => {
	const { namespace = NAME, name = NAME } = options;
	if (namespace.endsWith('commonjs')) {
		throw new Error(`namespace ${namespace} must not end with commonjs`);
	}

	const commonjsNamespace = `${namespace}-commonjs`;
	const polyfilledBuiltins = builtinsPolyfills();
	const polyfilledBuiltinsNames = [...polyfilledBuiltins.keys()];

	return {
		name,
		setup: ({ onLoad, onResolve, initialOptions }) => {
			// polyfills contain global keyword, it must be defined
			if (initialOptions.define && !initialOptions.define.global) {
				initialOptions.define.global = 'globalThis';
			} else if (!initialOptions.define) {
				initialOptions.define = { global: 'globalThis' };
			}

			const loader = async (args: esbuild.OnLoadArgs): Promise<esbuild.OnLoadResult> => {
				try {
					const argsPath = args.path.replace(/^node:/, '');
					const isCommonjs = args.namespace.endsWith('commonjs');

					const resolved = polyfilledBuiltins.get(removeEndingSlash(argsPath)) as string;
					const contents = (await fs.promises.readFile(resolved)).toString();
					const resolveDir = path.dirname(resolved);

					if (isCommonjs) {
						return {
							loader: 'js',
							contents: commonJsTemplate({
								importPath: argsPath
							}),
							resolveDir
						};
					}
					return {
						loader: 'js',
						contents,
						resolveDir
					};
				} catch (e) {
					console.error('node-modules-polyfill', e);
					return {
						contents: `export {}`,
						loader: 'js'
					};
				}
			};
			onLoad({ filter: /.*/, namespace }, loader);
			onLoad({ filter: /.*/, namespace: commonjsNamespace }, loader);
			const filter = new RegExp([...polyfilledBuiltinsNames, ...polyfilledBuiltinsNames.map((n) => `node:${n}`)].map(escapeRegex).join('|'));
			const resolver = (args: OnResolveArgs) => {
				const argsPath = args.path.replace(/^node:/, '');
				const ignoreRequire = args.namespace === commonjsNamespace;

				if (!polyfilledBuiltins.has(argsPath)) {
					return;
				}

				const isCommonjs = !ignoreRequire && args.kind === 'require-call';

				return {
					namespace: isCommonjs ? commonjsNamespace : namespace,
					path: argsPath
				};
			};
			onResolve({ filter }, resolver);
		}
	};
};
