'use strict';

const major = parseInt(METAL_VERSION.split('.')[0], 10); // eslint-disable-line
const noop = () => {};

export function sunset(fn) {
	return major > 2 ? fn : noop;
}
