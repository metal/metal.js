'use strict';

var marble = require('marble');

module.exports = {
	metalComponents: ['electric-marble-components'],
	sassOptions: {
		includePaths: ['node_modules', marble.src]
	},
	codeMirrorTheme: 'material',
	codeMirrorLanguages: ['soy', 'jsx', 'javascript', 'shell', 'xml'],
	vendorSrc: ['node_modules/marble/build/fonts/**']
};
