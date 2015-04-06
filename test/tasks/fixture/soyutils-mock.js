'use strict';

var merge = require('merge');

var delegates = {};

global.goog = {};
global.soy = {
	'$$augmentMap': merge,
	'$$escapeHtmlAttribute': identityFn,
	'$$escapeHtml': identityFn,
	'$$getDelegateFn': function(name, variant) {
		return (delegates[name] || {})[variant];
	},
	'$$getDelTemplateId': identityFn,
	'$$registerDelegateFn': function(name, variant, arg, fn) {
		delegates[name] = delegates[name] ? delegates[name] : {};
		delegates[name][variant] = fn;
	}
};
global.soydata = {
	'VERY_UNSAFE': {
		ordainSanitizedHtml: identityFn,
		ordainSanitizedHtmlForInternalBlocks: identityFn
	}
};

function identityFn(arg) {
	return arg;
}
