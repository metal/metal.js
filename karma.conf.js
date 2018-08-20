'use strict';

const lernaJson = require('./lerna.json');

let localLaunchers = {
	ChromeNoSandboxHeadless: {
		base: 'Chrome',
		flags: [
			'--no-sandbox',
			'--headless',
			'--disable-gpu',
			// Without a remote debugging port, Google Chrome exits immediately.
			'--remote-debugging-port=9333',
		],
	},
};

module.exports = function(config) {
	config.set({
		browserify: {
			debug: true,
			transform: [
				[
					'babelify',
					{
						presets: ['env'],
					},
				],
			],
			insertGlobalVars: {
				METAL_VERSION: function() {
					return '\'' + lernaJson.version + '\'';
				},
			},
		},

		browsers: Object.keys(localLaunchers),

		client: {
			mocha: {
				timeout: 4000,
			},
		},

		customLaunchers: localLaunchers,

		exclude: ['packages/metal-isomorphic/**/*.js'],

		files: [
			// Since all files will be added, we need to ensure manually that these
			// will be added first.
			{
				pattern:
					'packages/metal-incremental-dom/src/incremental-dom.js',
				watched: false,
				included: true,
				served: true,
			},
			{
				pattern:
					'packages/metal-incremental-dom/lib/incremental-dom.js',
				watched: false,
				included: true,
				served: true,
			},
			{
				pattern:
					'packages/metal-soy/node_modules/metal-soy-bundle/lib/bundle.js',
				watched: false,
				included: true,
				served: true,
			},
			{
				pattern:
					'packages/metal-web-component/node_modules/babel-polyfill/dist/polyfill.min.js',
				watched: false,
				included: true,
				served: true,
			},
			{
				pattern:
					'packages/metal-web-component/node_modules/@webcomponents/webcomponentsjs/webcomponents-lite.js',
				watched: false,
				included: false,
				served: true,
			},
			{
				pattern:
					'packages/metal-web-component/webcomponents_polyfill.js',
				watched: false,
				included: true,
				served: true,
			},
			{
				pattern: 'packages/metal*/test/**/*.js',
				watched: false,
				included: true,
				served: true,
			},
			{
				pattern: 'packages/metal-dom/fixtures/*',
				watched: true,
				included: false,
				served: true,
			},
		],

		frameworks: [
			'browserify',
			'mocha',
			'chai',
			'sinon',
			'source-map-support',
		],

		plugins: [
			'karma-browserify',
			'karma-chai',
			'karma-chrome-launcher',
			'karma-mocha',
			'karma-sinon',
			'karma-source-map-support',
		],

		preprocessors: {
			'packages/metal-incremental-dom/src/incremental-dom.js': [
				'browserify',
			],
			'packages/metal-incremental-dom/lib/incremental-dom.js': [
				'browserify',
			],
			'packages/metal-soy/node_modules/metal-soy-bundle/lib/bundle.js': [
				'browserify',
			],
			'packages/metal*/test/**/*.js': ['browserify'],
		},

		proxies: {
			'/fixtures/': '/base/packages/metal-dom/fixtures/',
		},

		singleRun: true,
	});
};
