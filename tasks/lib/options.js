'use strict';

function normalizeOptions(options) {
	options = options || {};
	options.bundleFileName = options.bundleFileName || 'metal.js';
	options.corePathFromSoy = options.corePathFromSoy || 'metaljs/src';
	options.buildDest = options.buildDest || 'build';
	options.buildSrc = options.buildSrc || 'src/**/*.js';
	options.globalName = options.globalName || 'metal';
	options.soyBase = options.soyBase;
	options.soyDest = options.soyDest || 'src';
	options.soyGeneratedOutputGlob = options.soyGeneratedOutputGlob === undefined ? '*.soy' : options.soyGeneratedOutputGlob;
	options.soyGenerationGlob = options.soyGenerationGlob === undefined ? '*.soy' : options.soyGenerationGlob;
	options.soySrc = options.soySrc || 'src/**/*.soy';
	options.taskPrefix = options.taskPrefix || '';
	return options;
}

module.exports = normalizeOptions;
