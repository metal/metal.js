'use strict';

var metal = require('gulp-metal');

metal.registerTasks({
	bundleFileName: 'state.js',
	mainBuildJsTasks: ['build:globals'],
	moduleName: 'metal-state',
	testNodeSrc: [
		'env/test/node.js',
		'test/**/*.js'
	]
});
