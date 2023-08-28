import esbuild, { type BuildOptions, type Message } from 'esbuild';

import { buildAbsolutePath, createEsbuildConfig } from '../util';

import type { NodePolyfillsOptions } from '../../dist';

function createConfig(buildOptions: Omit<BuildOptions, 'plugin'>, pluginOptions?: NodePolyfillsOptions): BuildOptions {
	return createEsbuildConfig(
		{
			format: 'iife',
			entryPoints: [buildAbsolutePath('./fixtures/input/errorModules/errorModules.ts')],
			...buildOptions,
		},
		pluginOptions,
	);
}

describe('Error Modules Test', () => {
	test('GIVEN a file that imports a node builtins that are defined as errors in the modules config THEN fail the build with appropriate error messages', async () => {
		const config = createConfig(
			{
				write: false,
			},
			{
				modules: {
					crypto: 'error',
					fs: 'error',
					path: true,
				},
			},
		);

		let errors: Message[] | undefined;

		try {
			await esbuild.build(config);
		} catch (error) {
			// @ts-expect-error error isn't type safe
			errors = error.errors;
		}

		expect(errors?.map((error) => error.text)).toMatchInlineSnapshot(`
			[
			  "Polyfill has not been configured for \\"node:crypto\\", imported by \\"tests/fixtures/input/errorModules/errorModules.ts\\"",
			  "Polyfill has not been configured for \\"node:fs\\", imported by \\"tests/fixtures/input/errorModules/errorModules.ts\\"",
			]
		`);
		expect(errors).toHaveLength(2);
	});

	test('GIVEN an error formatter has been provided THEN use the custom errors instead', async () => {
		const config = createConfig(
			{
				write: false,
			},
			{
				modules: {
					crypto: 'error',
					fs: 'error',
					path: true,
				},
				formatError(args) {
					return {
						notes: [{ text: 'This is a custom note' }],
						text: `args: ${JSON.stringify(args)}`,
					};
				},
			},
		);

		let errors: Message[] | undefined;

		try {
			await esbuild.build(config);
		} catch (error) {
			// @ts-expect-error error isn't type safe
			errors = error.errors;
		}

		expect(errors).toMatchInlineSnapshot(`
			[
			  {
			    "detail": -1,
			    "id": "",
			    "location": null,
			    "notes": [
			      {
			        "location": null,
			        "text": "This is a custom note",
			      },
			    ],
			    "pluginName": "node-modules-polyfills",
			    "text": "args: {\\"moduleName\\":\\"node:crypto\\",\\"importer\\":\\"tests/fixtures/input/errorModules/errorModules.ts\\",\\"polyfillExists\\":true}",
			  },
			  {
			    "detail": -1,
			    "id": "",
			    "location": null,
			    "notes": [
			      {
			        "location": null,
			        "text": "This is a custom note",
			      },
			    ],
			    "pluginName": "node-modules-polyfills",
			    "text": "args: {\\"moduleName\\":\\"node:fs\\",\\"importer\\":\\"tests/fixtures/input/errorModules/errorModules.ts\\",\\"polyfillExists\\":true}",
			  },
			]
		`);
		expect(errors).toHaveLength(2);
	});

	test('GIVEN outfile maps to a .mjs file THEN fail the build with appropriate error messages', async () => {
		const config = createConfig(
			{
				write: false,
				outdir: undefined,
				outfile: 'out.mjs',
			},
			{
				modules: {
					crypto: 'error',
					fs: 'error',
					path: true,
				},
			},
		);

		let errors: Message[] | undefined;

		try {
			await esbuild.build(config);
		} catch (error) {
			// @ts-expect-error error isn't type safe
			errors = error.errors;
		}

		expect(errors?.map((error) => error.text)).toMatchInlineSnapshot(`
			[
			  "Polyfill has not been configured for \\"node:crypto\\", imported by \\"tests/fixtures/input/errorModules/errorModules.ts\\"",
			  "Polyfill has not been configured for \\"node:fs\\", imported by \\"tests/fixtures/input/errorModules/errorModules.ts\\"",
			]
		`);
		expect(errors).toHaveLength(2);
	});

	test('GIVEN outExtension maps .js to .mjs THEN fail the build with appropriate error messages', async () => {
		const config = createConfig(
			{
				write: false,
				outExtension: {
					'.js': '.mjs',
				},
			},
			{
				modules: {
					crypto: 'error',
					fs: 'error',
					path: true,
					trace_events: 'error', // This doesn't have a polyfill available
				},
			},
		);

		let errors: Message[] | undefined;

		try {
			await esbuild.build(config);
		} catch (error) {
			// @ts-expect-error error isn't type safe
			errors = error.errors;
		}

		expect(errors?.map((error) => error.text)).toMatchInlineSnapshot(`
			[
			  "Polyfill has not been configured for \\"node:crypto\\", imported by \\"tests/fixtures/input/errorModules/errorModules.ts\\"",
			  "Polyfill has not been configured for \\"node:fs\\", imported by \\"tests/fixtures/input/errorModules/errorModules.ts\\"",
			]
		`);
		expect(errors).toHaveLength(2);
	});

	test('GIVEN write mode is enabled when using error polyfill modules THEN fail the build with appropriate error messages', async () => {
		const config = createConfig(
			{
				write: true,
			},
			{
				modules: {
					crypto: 'error',
					fs: 'error',
					path: true,
				},
			},
		);

		let errors: Message[] | undefined;

		try {
			await esbuild.build(config);
		} catch (error) {
			// @ts-expect-error error isn't type safe
			errors = error.errors;
		}

		expect(errors?.map((error) => error.text)).toMatchInlineSnapshot(`
			[
			  "The \\"write\\" build option must be set to false when using the \\"error\\" polyfill type",
			]
		`);
		expect(errors).toHaveLength(1);
	});
});
