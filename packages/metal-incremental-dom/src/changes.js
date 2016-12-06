'use strict';

import { getData } from './data';

/**
 * Clears the changes tracked so far.
 * @param {!Object} data
 */
export function clearChanges(data) {
	data.changes = null;
}

/**
 * Handles the `stateKeyChanged` event from a component. Stores change data.
 * @param {!Object} data
 * @param {!Object} eventData
 * @private
 */
function handleStateKeyChanged_(data, eventData) {
	data.changes = data.changes || {};
	const type = eventData.type || 'props';
	data.changes[type] = data.changes[type] || {};
	data.changes[type][eventData.key] = eventData;
}

/**
 * Returns an object with changes in the given component since the last time,
 * or null if there weren't any.
 * @param {!Component} component
 * @return {Object}
 */
export function getChanges(component) {
	return getData(component).changes;
}

/**
 * Starts tracking changes for the given component
 * @param {!Component} component
 */
export function trackChanges(component) {
	const data = getData(component);
	component.on('stateKeyChanged', handleStateKeyChanged_.bind(null, data));
}
