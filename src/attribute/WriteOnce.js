'use strict';

export default function writeOnce(target, name) {
	target.ATTRS = target.ATTRS || {};
	target.ATTRS[name] = target.ATTRS[name] || {};
	target.ATTRS[name].writeOnce = true;
}