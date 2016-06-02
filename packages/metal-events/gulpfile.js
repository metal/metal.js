'use strict';

var metal = require('gulp-metal');

metal.registerTasks({
	bundleCssFileName: 'events.css',
	bundleFileName: 'events.js',
	mainBuildJsTasks: ['build:globals'],
	moduleName: 'metal-events',
	testNodeSrc: [
		'env/test/node.js',
		'test/**/*.js'
	]
});
