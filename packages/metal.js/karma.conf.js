'use strict';

module.exports = function (config) {
	config.set({
		frameworks: ['mocha', 'chai', 'sinon', 'source-map-support', 'commonjs'],

		files: [
			'src/**/*.js',
			'test/**/*.js'
		],

		preprocessors: {
			'src/**/*.js': ['babel', 'commonjs'],
			'test/**/*.js': ['babel', 'commonjs']
		},

		browsers: ['Chrome'],

		babelPreprocessor: {options: {
			presets: ['metal'],
			sourceMap: 'both'
		}}
	});
};
