'use strict';

module.exports = function (config) {
	config.set({
		frameworks: ['mocha', 'chai', 'sinon', 'source-map-support', 'commonjs'],

		files: [
			'node_modules/closure-templates/soyutils.js',
			'src/**/*.js',
			'test/src/**/*.js',
			{pattern: 'test/fixtures/*.js', watched: true, included: false, served: true}
		],

		preprocessors: {
			'src/**/*.js': ['babel', 'commonjs'],
			'test/src/**/*.js': ['babel', 'commonjs']
		},

		proxies: {
		  '/test/fixtures/': '/base/test/fixtures/'
		},

		browsers: ['Chrome'],

		babelPreprocessor: {options: {
			presets: ['metal'],
			sourceMap: 'both'
		}}
	});
};
