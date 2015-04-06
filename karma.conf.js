var isparta = require('isparta');
var istanbul = require('browserify-istanbul');

module.exports = function (config) {
	config.set({
		frameworks: ['mocha', 'chai', 'sinon', 'browserify'],

		files: [
			'test/src/html/fixture/*.html',
			'node_modules/closure-templates/soyutils.js',
			'src/**/*.js',
			'test/src/**/*.js'
		],

		preprocessors: {
			'src/**/*.js': ['browserify'],
			'test/src/**/*.js': ['browserify'],
			// Fixture htmls should go through `html2js` so tests can access
			// them through the `window.__html__` variable.
			'test/src/html/fixture/*.html': ['html2js']
		},

		browserify: {
			transform: [istanbul({
				defaultIgnore: false,
				instrumenter: isparta
			})],
			debug: true
		},

		browsers: ['Chrome'],

		reporters: ['coverage', 'progress'],

		coverageReporter: {
			ignore: ['**/bower_components/**', '**/test/**', '**/src/async/*.js', '**/*.soy.js'],
			reporters: [
				{type: 'text-summary'},
				{type: 'html'},
				{ type: 'lcov', subdir: 'lcov' }
			]
		}
	});
};
