'use strict';

module.exports = function (config) {
  config.set({
    frameworks: ['browserify', 'mocha', 'chai', 'sinon', 'source-map-support'],

    files: [
      // Since all files will be added, we need to ensure manually that these
      // will be added first.
      'packages/metal-incremental-dom/src/incremental-dom.js',
      'packages/metal-incremental-dom/lib/incremental-dom.js',
      'packages/metal-soy/node_modules/metal-soy-bundle/lib/bundle.js',
      'packages/metal-soy/node_modules/html2incdom/lib/*.js',

      'packages/metal*/src/**/*.js',
      'packages/metal*/test/**/*.js',
      {pattern: 'packages/metal-dom/fixtures/*', watched: true, included: false, served: true}
    ],

    preprocessors: {
      'packages/metal-soy/node_modules/metal-soy-bundle/lib/bundle.js': ['browserify'],
      'packages/metal-soy/node_modules/html2incdom/lib/*.js': ['browserify'],
      'packages/metal*/src/**/*.js': ['browserify'],
      'packages/metal*/test/**/*.js': ['browserify']
    },

    browsers: ['Chrome'],

		browserify: {
        debug: true,
        transform: [ 'babelify' ]
    },

    proxies: {
      '/fixtures/': '/base/packages/metal-dom/fixtures/'
    }
  });
};
