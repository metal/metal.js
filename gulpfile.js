'use strict';

var metal = require('gulp-metal');

metal.registerTasks({
	bundleCssFileName: 'attribute.css',
	bundleFileName: 'attribute.js',
	mainBuildJsTasks: ['build:globals'],
	moduleName: 'metal-attribute',
	testNodeSrc: [
		'env/test/node.js',
		'test/**/*.js'
	]
});
