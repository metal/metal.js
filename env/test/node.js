var assert = require('assert');
var sinon = require('sinon');
var lerna = require('../../lerna.json');

global.assert = assert;
global.sinon = sinon;
global.METAL_VERSION = lerna.version;

// In order to keep the test code the same for different environments, even
// though it's a common antipattern, jsdom is copying globals from a jsdom
// window onto the Node.js global.
// https://github.com/tmpvar/jsdom/wiki/Don't-stuff-jsdom-globals-onto-the-Node-global

require('jsdom-global')();
