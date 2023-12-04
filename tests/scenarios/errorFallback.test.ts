import esbuild, { type BuildOptions, type Message } from 'esbuild';

import { buildAbsolutePath, createEsbuildConfig } from '../util';

import type { NodePolyfillsOptions } from '../../dist';

function createConfig(buildOptions: Omit<BuildOptions, 'plugins'>, pluginOptions?: NodePolyfillsOptions): BuildOptions {
	return createEsbuildConfig(
		{
			format: 'iife',
			entryPoints: [buildAbsolutePath('./fixtures/input/errorFallback/errorFallback.ts')],
			...buildOptions,
		},
		pluginOptions,
	);
}

describe('Error Fallback Test', () => {
	test('GIVEN a file that imports a node builtins that are defined as errors in the modules config THEN fail the build with appropriate error messages', async () => {
		const config = createConfig(
			{
				write: false,
			},
			{
				fallback: 'error',
				modules: {
					path: true,
					trace_events: true, // This will be a fallback since it's not polyfilled
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
			  "Polyfill has not been configured for "node:crypto", imported by "tests/fixtures/input/errorFallback/errorFallback.ts"",
			  "Polyfill does not exist for "node:trace_events", imported by "tests/fixtures/input/errorFallback/errorFallback.ts"",
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
				fallback: 'error',
				formatError(args) {
					return {
						notes: [{ text: 'This is a custom note' }],
						text: `args: ${JSON.stringify(args)}`,
					};
				},
				modules: {
					path: true,
					trace_events: true, // This will be a fallback since it's not polyfilled
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
			    "text": "args: {"moduleName":"node:crypto","importer":"tests/fixtures/input/errorFallback/errorFallback.ts","polyfillExists":true}",
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
			    "text": "args: {"moduleName":"node:trace_events","importer":"tests/fixtures/input/errorFallback/errorFallback.ts","polyfillExists":false}",
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
				fallback: 'error',
				modules: {
					path: true,
					trace_events: true, // This will be a fallback since it's not polyfilled
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
			  "Polyfill has not been configured for "node:crypto", imported by "tests/fixtures/input/errorFallback/errorFallback.ts"",
			  "Polyfill does not exist for "node:trace_events", imported by "tests/fixtures/input/errorFallback/errorFallback.ts"",
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
				fallback: 'error',
				modules: {
					path: true,
					trace_events: true, // This will be a fallback since it's not polyfilled
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
			  "Polyfill has not been configured for "node:crypto", imported by "tests/fixtures/input/errorFallback/errorFallback.ts"",
			  "Polyfill does not exist for "node:trace_events", imported by "tests/fixtures/input/errorFallback/errorFallback.ts"",
			]
		`);
		expect(errors).toHaveLength(2);
	});

	test('GIVEN write mode is enabled when using error polyfill fallback THEN fail the build with appropriate error messages', async () => {
		const config = createConfig(
			{
				write: true,
			},
			{
				fallback: 'error',
				modules: {
					path: true,
					trace_events: true, // This will be a fallback since it's not polyfilled
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
			  "The "write" build option must be set to false when using the "error" polyfill type",
			]
		`);
		expect(errors).toHaveLength(1);
	});
});
