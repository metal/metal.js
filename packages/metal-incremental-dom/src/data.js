'use strict';

const RENDERER_DATA = '__METAL_IC_RENDERER_DATA__';

/**
 * Removes the incremental dom renderer data object for this component.
 * @param {!Component} component
 */
export function clearData(component) {
	component[RENDERER_DATA] = null;
}

/**
 * Gets the incremental dom renderer data object for this component, creating
 * it if it doesn't exist yet.
 * @param {!Component} component
 * @return {!Object}
 */
export function getData(component) {
	if (!component[RENDERER_DATA]) {
		component[RENDERER_DATA] = {};
	}
	return component[RENDERER_DATA];
}
