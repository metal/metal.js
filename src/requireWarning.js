'use strict';

import 'metal-soy-bundle';

var original = goog.require;
goog.require = function(name) {
	try {
		return original(name);
	} catch (error) {
		var parts = name.split('.');
		if (parts[parts.length - 1] === 'incrementaldom') {
			name = name.substr(0, name.length - 15);
			console.warn(
				'The template with namespace "' + name + '" was required before being ' +
				'declared via "goog.module". Make sure to import any soy components (or ' +
				'templates) before importing your component\'s own soy file that uses ' +
				'them, to avoid this error.'
			);
		}
		throw error;
	}
};
