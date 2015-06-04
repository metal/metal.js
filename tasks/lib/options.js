'use strict';

function normalizeOptions(options) {
	options = options || {};
	options.registerSoyTasks = options.registerSoyTasks === undefined ? true : options.registerSoyTasks;
	options.registerTestTasks = options.registerTestTasks === undefined ? true : options.registerTestTasks;
	options.registerBuildTasks = options.registerBuildTasks === undefined ? true : options.registerBuildTasks;
	options.bundleFileName = options.bundleFileName || 'metal.js';
	options.corePathFromSoy = options.corePathFromSoy || 'bower:metal/src';
	options.buildDest = options.buildDest || 'build';
	options.buildSrc = options.buildSrc || 'src/**/*.js';
	options.globalName = options.globalName || 'metal';
	options.soyBase = options.soyBase;
	options.soyDest = options.soyDest || 'src';
	options.soyGeneratedDest = options.soyGeneratedDest || options.buildDest;
	options.soyGeneratedOutputGlob = options.soyGeneratedOutputGlob === undefined ? '*.soy' : options.soyGeneratedOutputGlob;
	options.soyGenerationGlob = options.soyGenerationGlob === undefined ? '*.soy' : options.soyGenerationGlob;
	options.soySkipCompilation = !!options.soySkipCompilation;
	options.soyLocales = options.soyLocales;
	options.soyMessageFilePathFormat = options.soyMessageFilePathFormat;
	options.soySrc = options.soySrc || 'src/**/*.soy';
	options.taskPrefix = options.taskPrefix || '';
	return options;
}

module.exports = normalizeOptions;
