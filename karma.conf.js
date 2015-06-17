module.exports = function (config) {
	config.set({
		frameworks: ['mocha', 'chai', 'sinon', 'source-map-support', 'commonjs'],

		files: [
			'test/src/html/fixture/*.html',
			'bower_components/soyutils/soyutils.js',
			'src/**/*.js',
			'test/src/**/*.js'
		],

		preprocessors: {
			'src/**/*.js': ['babel', 'commonjs'],
			'test/src/**/*.js': ['babel', 'commonjs'],
			// Fixture htmls should go through `html2js` so tests can access
			// them through the `window.__html__` variable.
			'test/src/html/fixture/*.html': ['html2js']
		},

		browsers: ['Chrome'],

		babelPreprocessor: {options: {sourceMap: 'both'}}
	});
};
