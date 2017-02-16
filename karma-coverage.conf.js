'use strict';

var lernaJson = require('./lerna.json');

module.exports = function(config) {
	config.set({
		frameworks: ['browserify', 'mocha', 'chai', 'sinon', 'source-map-support'],

		files: [
			// Since all files will be added, we need to ensure manually that these
			// will be added first.
			{
				pattern: 'packages/metal-incremental-dom/src/incremental-dom.js',
				watched: false,
				included: true,
				served: true
			},
			{
				pattern: 'packages/metal-incremental-dom/lib/incremental-dom.js',
				watched: false,
				included: true,
				served: true
			},
			{
				pattern: 'packages/metal-soy-bundle/lib/bundle.js',
				watched: false,
				included: true,
				served: true
			},
			{
				pattern: 'packages/metal-soy/node_modules/html2incdom/lib/*.js',
				watched: false,
				included: true,
				served: true
			},

			{
				pattern: 'packages/metal*/test/**/*.js',
				watched: false,
				included: true,
				served: true
			},
			{
				pattern: 'packages/metal-dom/fixtures/*',
				watched: true,
				included: false,
				served: true
			}
		],

		preprocessors: {
			'packages/metal-incremental-dom/src/incremental-dom.js': ['browserify'],
			'packages/metal-incremental-dom/lib/incremental-dom.js': ['browserify'],
			'packages/metal-soy-bundle/lib/bundle.js': ['browserify'],
			'packages/metal-soy/node_modules/html2incdom/lib/*.js': ['browserify'],
			'packages/metal*/test/**/*.js': ['browserify']
		},

		browsers: ['Chrome'],

		browserify: {
			debug: true,
			transform: [
				[
					'babelify',
					{
						plugins: ['istanbul'],
						presets: ['es2015']
					}
				]
			],
			insertGlobalVars: {
				METAL_VERSION: function() {
					return '\'' + lernaJson.version + '\'';
				}
			}
		},

		reporters: ['coverage', 'progress'],

		coverageReporter: {
			reporters: [
				{
					type: 'lcov',
					subdir: 'lcov'
				},
				{
					type: 'text-summary'
				}
			]
		},

		autoWatch: true,

		proxies: {
			'/fixtures/': '/base/packages/metal-dom/fixtures/'
		}
	});
};
