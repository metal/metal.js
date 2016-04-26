'use strict';

var metal = require('gulp-metal');

metal.registerTasks({
	bundleCssFileName: 'incrementalDom.css',
	bundleFileName: 'incrementalDom.js',
	moduleName: 'metal-incrementalDom',
	noSoy: true
});
