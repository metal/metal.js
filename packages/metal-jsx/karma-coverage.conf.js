'use strict';

var metalKarmaConfig = require('metal-karma-config/no-soy-coverage');

module.exports = function (config) {
  metalKarmaConfig(config);
  delete config.preprocessors['src/**/!(*.soy).js'];
  config.preprocessors['src/iDOMHelpers.js'] = ['babel', 'commonjs'];
  config.preprocessors['src/**/!(iDOMHelpers).js'] = ['coverage', 'commonjs'];
};
