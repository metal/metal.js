'use strict';

var metal = require('gulp-metal');

metal.registerTasks({
	bundleCssFileName: 'component.css',
	bundleFileName: 'component.js',
	mainBuildJsTasks: ['build:globals'],
	moduleName: 'metal-component'
});
