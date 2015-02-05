module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],

    frameworks: ['jspm', 'mocha', 'chai', 'sinon'],

    jspm: {
      // ES6 files need to go through jspm for module loading.
      loadFiles: ['src/**/*.js', 'test/**/*.js']
    },

    files: [
      'test/html/fixture/*.html',
    ],

    preprocessors: {
      // All src files should be included in the coverage report, except
      // Promise, since that's not our code for now. These files don't
      // need to go through the `6to5` preprocessor, as the `coverage`
      // preprocessor already does the necessary conversion.
      'src/*.js': ['coverage'],
      'src/!(promise)/**/*.js': ['coverage'],

      // Since tests and Promise are not going through the `coverage`
      // preprocessor we need to explicitly make them go through `6to5`.
      'src/promise/Promise.js': ['6to5'],
      'test/**/*.js': ['6to5'],

      // Fixture htmls should go through `html2js` so tests can access
      // them through the `window.__html__` variable.
      'test/html/fixture/*.html': ['html2js']
    },

    '6to5Preprocessor': {
      options: {
        sourceMap: 'inline',
        modules: 'system'
      }
    },

    reporters: ['coverage', 'progress'],

    coverageReporter: {
      instrumenters: { isparta : require('isparta') },
      instrumenter: {
        '**/*.js': 'isparta'
      },
      reporters: [
        {
          type : 'text-summary'
        },
        {
          type : 'html'
        },
        {
          type: 'lcov',
          subdir: 'lcov'
        },
      ]
    }
  });
};
