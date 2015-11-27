var isparta = require('isparta');

module.exports = function (config) {
	config.set({
		frameworks: ['mocha', 'chai', 'sinon', 'source-map-support', 'commonjs'],

		files: [
			'test/src/html/fixture/*.html',
			'bower_components/soyutils/soyutils.js',
			'src/**/*.js',
			'test/src/**/*.js',
			{pattern: 'test/fixtures/*.js', watched: true, included: false, served: true}
		],

		preprocessors: {
			// All src files should be included in the coverage report, except
			// async, since that's not our code for now. These files don't
			// need to go through the `babel` preprocessor, as the `coverage`
			// preprocessor already does the necessary conversion.
			'src/*.js': ['coverage', 'commonjs'],
			'src/!(async)/**/*.js': ['coverage', 'commonjs'],
			// Since tests and async are not going through the `coverage`
			// preprocessor we need to explicitly make them go through `babel`.
			'src/async/async.js': ['babel', 'commonjs'],
			'test/src/**/*.js': ['babel', 'commonjs'],
			// Fixture htmls should go through `html2js` so tests can access
			// them through the `window.__html__` variable.
			'test/src/html/fixture/*.html': ['html2js']
		},

		proxies: {
		  '/test/fixtures/': '/base/test/fixtures/'
		},

		browsers: ['Chrome'],

		reporters: ['coverage', 'progress'],

		babelPreprocessor: {options: {
			presets: ['metal'],
			sourceMap: 'both'
		}},

		coverageReporter: {
			instrumenters: {isparta : isparta},
			instrumenter: {'**/*.js': 'isparta'},
			reporters: [
				{type: 'html'},
				{type: 'lcov', subdir: 'lcov'},
				{type: 'text-summary'}
			]
		}
	});
};
