import { builtinModules } from 'node:module';
import path from 'node:path';
import process from 'node:process';

import { loadPackageJSON } from 'local-pkg';

import { getCachedPolyfillContent, getCachedPolyfillPath } from './polyfill.js';
import { escapeRegex, commonJsTemplate, normalizeNodeBuiltinPath } from './utils/util.js';

import type { OnResolveArgs, OnResolveResult, PartialMessage, Plugin } from 'esbuild';
import type esbuild from 'esbuild';

const NAME = 'node-modules-polyfills';

export interface NodePolyfillsOptions {
	fallback?: 'empty' | 'error' | 'none';
	formatError?: (
		this: void,
		args: { importer: string; moduleName: string; polyfillExists: boolean },
	) => PartialMessage | Promise<PartialMessage>;
	globals?: { Buffer?: boolean; process?: boolean };
	modules?: Record<string, boolean | 'empty' | 'error'> | string[];
	name?: string;
	namespace?: string;
}

const loader = async (args: esbuild.OnLoadArgs): Promise<esbuild.OnLoadResult> => {
	try {
		const isCommonjs = args.namespace.endsWith('commonjs');

		const resolved = await getCachedPolyfillPath(args.path);
		const resolveDir = path.dirname(resolved);

		if (isCommonjs) return { loader: 'js', contents: commonJsTemplate({ importPath: args.path }), resolveDir };

		const contents = await getCachedPolyfillContent(args.path);

		return { loader: 'js', contents, resolveDir };
	} catch (error) {
		console.error('node-modules-polyfill', error);
		return { contents: `export {}`, loader: 'js' };
	}
};

export const nodeModulesPolyfillPlugin = (options: NodePolyfillsOptions = {}): Plugin => {
	const {
		globals = {},
		modules: modulesOption = builtinModules,
		fallback = 'none',
		formatError,
		namespace = NAME,
		name = NAME,
	} = options;
	
	// Track if user provided custom modules configuration
	const hasCustomModules = options.modules !== undefined;
	if (namespace.endsWith('commonjs')) throw new Error(`namespace ${namespace} must not end with commonjs`);

	if (namespace.endsWith('empty')) throw new Error(`namespace ${namespace} must not end with empty`);

	if (namespace.endsWith('error')) throw new Error(`namespace ${namespace} must not end with error`);

	const modules = Array.isArray(modulesOption)
		? Object.fromEntries((modulesOption as string[]).map((mod) => [mod, true]))
		: (modulesOption as Record<string, boolean | 'empty' | 'error'>);

	const commonjsNamespace = `${namespace}-commonjs`;
	const emptyNamespace = `${namespace}-empty`;
	const errorNamespace = `${namespace}-error`;

	const shouldDetectErrorModules = fallback === 'error' || Object.values(modules).includes('error');

	return {
		name,
		setup: ({ onLoad, onResolve, onEnd, initialOptions }) => {
			if (shouldDetectErrorModules && initialOptions.write !== false)
				throw new Error(`The "write" build option must be set to false when using the "error" polyfill type`);

			const root = initialOptions.absWorkingDir ?? process.cwd();

			// polyfills contain global keyword, it must be defined
			if (initialOptions.define && !initialOptions.define.global) initialOptions.define.global = 'globalThis';
			else if (!initialOptions.define) initialOptions.define = { global: 'globalThis' };

			initialOptions.inject = initialOptions.inject ?? [];

			if (globals.Buffer) initialOptions.inject.push(path.resolve(__dirname, '../globals/Buffer.js'));

			if (globals.process) initialOptions.inject.push(path.resolve(__dirname, '../globals/process.js'));

			onLoad({ filter: /.*/, namespace: emptyNamespace }, () => ({
				loader: 'js',
				// Use an empty CommonJS module here instead of ESM to avoid
				// "No matching export" errors in esbuild for anything that
				// is imported from this file.
				contents: 'module.exports = {}',
			}));

			onLoad({ filter: /.*/, namespace: errorNamespace }, (args) => ({
				loader: 'js',
				contents: `module.exports = ${JSON.stringify(
					// This encoded string is detected and parsed at the end of the build to report errors
					`__POLYFILL_ERROR_START__::MODULE::${args.path}::IMPORTER::${args.pluginData.importer}::__POLYFILL_ERROR_END__`,
				)}`,
			}));

			onLoad({ filter: /.*/, namespace }, loader);
			onLoad({ filter: /.*/, namespace: commonjsNamespace }, loader);

			// If we are using fallbacks, we need to handle all builtin modules so that we can replace their contents,
			// otherwise we only need to handle the modules that are configured (which is everything by default)
			// Special case: if user has custom modules config but some modules are missing (not explicitly false),
			// we want to handle all builtins to provide helpful errors, but only when fallback is 'none'
			const hasIncompleteModuleConfig = hasCustomModules && 
				Array.isArray(modulesOption) && 
				modulesOption.length > 0 && 
				modulesOption.length < builtinModules.length &&
				fallback === 'none';
			
			const bundledModules =
				fallback === 'none' && !hasCustomModules
					? Object.keys(modules).filter((moduleName) => builtinModules.includes(moduleName))
					: hasIncompleteModuleConfig
					? builtinModules
					: fallback === 'none'
					? Object.keys(modules).filter((moduleName) => builtinModules.includes(moduleName))
					: builtinModules;

			const filter = new RegExp(`^(?:node:)?(?:${bundledModules.map(escapeRegex).join('|')})$`);

			const resolver = async (args: OnResolveArgs): Promise<OnResolveResult | undefined> => {
				const result = {
					empty: { namespace: emptyNamespace, path: args.path, sideEffects: false },
					error: {
						namespace: errorNamespace,
						path: args.path,
						sideEffects: false,
						pluginData: { importer: path.relative(root, args.importer).replace(/\\/g, '/') },
					},
					none: undefined,
				} as const satisfies Record<string, OnResolveResult | undefined>;

				// https://github.com/defunctzombie/package-browser-field-spec
				if (initialOptions.platform === 'browser') {
					const packageJson = await loadPackageJSON(args.resolveDir);
					const browserFieldValue = packageJson?.browser as unknown as
						| Record<string, string | false>
						| string
						| undefined;

					if (typeof browserFieldValue === 'string') return;
					const browserFieldValueForModule = browserFieldValue?.[args.path];

					// This is here to support consumers who have used the
					// "external" option to exclude all Node builtins (e.g.
					// Remix v1 does this), otherwise the import/require is left
					// in the output and throws an error at runtime. Ideally we
					// would just return undefined for any browser field value,
					// and we can safely switch to this in a major version.
					if (browserFieldValueForModule === false) return result.empty;

					if (browserFieldValueForModule !== undefined) return;
				}

				const moduleName = normalizeNodeBuiltinPath(args.path);

				const polyfillOption = modules[moduleName] ?? modules[`node:${moduleName}`];

				if (!polyfillOption) {
					// If user has custom modules config and this is a builtin module, provide helpful error
					// But only if the module wasn't explicitly set to false and it's an array config with missing modules
					if (hasIncompleteModuleConfig && builtinModules.includes(moduleName)) {
						const helpMessage = [
							`Could not resolve "${args.path}" because it's not included in your modules configuration.`,
							``,
							`To fix this, add "${moduleName}" to your modules array:`,
							`  modules: [${(modulesOption as string[]).map(module => `'${module}'`).join(', ')}, '${moduleName}']`,
							``,
							`Or use the default configuration to polyfill all builtin modules:`,
							`  nodeModulesPolyfillPlugin() // no options`,
							``
						].join('\n');
						
						throw new Error(helpMessage);
					}
					return result[fallback];
				}

				if (polyfillOption === 'error' || polyfillOption === 'empty') return result[polyfillOption];

				const polyfillPath = await getCachedPolyfillPath(moduleName).catch(() => null);

				if (!polyfillPath) return result[fallback];

				const ignoreRequire = args.namespace === commonjsNamespace;
				const isCommonjs = !ignoreRequire && args.kind === 'require-call';

				return { namespace: isCommonjs ? commonjsNamespace : namespace, path: args.path, sideEffects: false };
			};

			onResolve({ filter }, resolver);

			onEnd(async ({ outputFiles = [] }) => {
				// This logic needs to be run when the build is complete because
				// we need to check the output files after tree-shaking has been
				// performed. If we did this in the onLoad hook, we could throw
				// errors for modules that are not even present in the final
				// output. This is particularly important when building projects
				// that target both server and browser since the browser build
				// may not use all of the modules that the server build does. If
				// you're only building for the browser, this feature is less
				// useful since any unpolyfilled modules will be treated just
				// like any other missing module.

				if (!shouldDetectErrorModules) return;

				const errors: PartialMessage[] = [];

				const { outfile, outExtension = {} } = initialOptions;
				const jsExtension = outfile ? path.extname(outfile) : outExtension['.js'] || '.js';
				const jsFiles = outputFiles.filter((file) => path.extname(file.path) === jsExtension);

				for (const file of jsFiles) {
					const matches = file.text.matchAll(
						/__POLYFILL_ERROR_START__::MODULE::(?<moduleName>.+?)::IMPORTER::(?<importer>.+?)::__POLYFILL_ERROR_END__/g,
					);

					for (const { groups } of matches) {
						const { moduleName, importer } = groups!;
						const polyfillExists = (await getCachedPolyfillPath(moduleName).catch(() => null)) !== null;
						errors.push({
							pluginName: name,
							text: polyfillExists
								? `Polyfill has not been configured for "${moduleName}", imported by "${importer}"`
								: `Polyfill does not exist for "${moduleName}", imported by "${importer}"`,
							...(formatError ? await formatError({ moduleName, importer, polyfillExists }) : {}),
						});
					}
				}

				return { errors };
			});
		},
	};
};
