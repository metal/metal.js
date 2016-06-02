'use strict';

var metal = require('gulp-metal');

metal.registerTasks({
	bundleCssFileName: 'dom.css',
	bundleFileName: 'dom.js',
	mainBuildJsTasks: ['build:globals'],
	moduleName: 'metal-dom'
});
