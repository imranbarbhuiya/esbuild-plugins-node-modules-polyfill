import { defineConfig } from 'tsdown';

export default defineConfig({
	clean: true,
	dts: true,
	entry: ['src/index.ts'],
	format: ['cjs'],
	minify: false,
	deps: {
		skipNodeModulesBundle: true,
	},
	sourcemap: true,
	target: 'es2021',
	tsconfig: 'src/tsconfig.json',
	treeshake: true,
});
