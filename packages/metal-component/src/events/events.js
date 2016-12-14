'use strict';

import { getFunctionName, isFunction, isObject, isString } from 'metal';

/**
 * Adds the listeners specified in the given object.
 * @param {!Component} component
 * @param {Object} events
 * @return {!Array<!EventHandle>} Handles from all subscribed events.
 */
export function addListenersFromObj(component, events) {
	const eventNames = Object.keys(events || {});
	const handles = [];
	for (let i = 0; i < eventNames.length; i++) {
		const info = extractListenerInfo_(component, events[eventNames[i]]);
		if (info.fn) {
			let handle;
			if (info.selector) {
				handle = component.delegate(eventNames[i], info.selector, info.fn);
			} else {
				handle = component.on(eventNames[i], info.fn);
			}
			handles.push(handle);
		}
	}
	return handles;
}

/**
 * Extracts listener info from the given value.
 * @param {!Component} component
 * @param {!Component} component
 * @param {function()|string|{selector:string,fn:function()|string}} value
 * @return {!{selector:string,fn:function()}}
 * @protected
 */
function extractListenerInfo_(component, value) {
	const info = {
		fn: value
	};
	if (isObject(value) && !isFunction(value)) {
		info.selector = value.selector;
		info.fn = value.fn;
	}
	if (isString(info.fn)) {
		info.fn = getComponentFn(component, info.fn);
	}
	return info;
}

/**
 * Gets the listener function from its name. Throws an error if none exist.
 * @param {!Component} component
 * @param {string} fnName
 * @return {function()}
 */
export function getComponentFn(component, fnName) {
	if (isFunction(component[fnName])) {
		return component[fnName].bind(component);
	} else {
		console.error(`No function named ${fnName} was found in the component
			"${getFunctionName(component.constructor)}". Make sure that you specify
			valid function names when adding inline listeners`
		);
	}
}
