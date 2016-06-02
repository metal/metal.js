'use strict';

module.exports = function (config) {
  config.set({
    frameworks: ['browserify', 'mocha', 'chai', 'sinon', 'source-map-support'],

    files: [
      'packages/metal*/src/**/*.js',
      'packages/metal*/test/**/*.js'
    ],

    preprocessors: {
      'packages/metal*/src/**/*.js': ['browserify'],
      'packages/metal*/test/**/*.js': ['browserify']
    },

    browsers: ['Chrome'],

		browserify: {
        debug: true,
        transform: [ 'babelify' ]
    }
  });
};
