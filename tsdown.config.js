const { defineConfig } = require('tsdown');

module.exports = defineConfig({
	clean: true,
	dts: true,
	entry: ['src/index.ts'],
	format: ['cjs'],
	fixedExtension: false,
	minify: false,
	deps: {
		skipNodeModulesBundle: true,
	},
	sourcemap: true,
	target: 'es2021',
	tsconfig: 'src/tsconfig.json',
	treeshake: true,
});
