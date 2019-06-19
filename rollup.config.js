const includePathOptions = {
	include: {},
	paths: ["tmp-js/"],
	external: [],
	extensions: ['.js', '.json']
}

export default {
	input: "tmp-js/index.js",
	treeshake: true,
	plugins: [
		require("rollup-plugin-node-resolve")(),
		require("rollup-plugin-commonjs")(),
		require("rollup-plugin-includepaths")(includePathOptions),
		require('rollup-plugin-sourcemaps')()
	],
	output: {
		file: "docs/bundle.js",
		format: 'es',
		sourcemap: 'inline'
	}
};