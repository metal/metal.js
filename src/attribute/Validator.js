'use strict';

export default function validator(val) {
	return function (target, name, decorator) {
		target.ATTRS = target.ATTRS || {};
		target.ATTRS[name] = target.ATTRS[name] || {};
		target.ATTRS[name].validator = val;
	    return decorator;
	};
}