const autoPrefixerOptions = {
	overrideBrowserslist: [
		"ie >= 10",
		"ios >= 8",
		"android >= 4.0",
		"> 3% in JP"
	]
};

module.exports = {
	plugins: [
		require("autoprefixer")(autoPrefixerOptions)
	]
}