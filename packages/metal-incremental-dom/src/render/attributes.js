'use strict';

import { delegate } from 'metal-dom';
import { getComponentFn } from 'metal-component';
import { getOriginalFn } from '../intercept';
import { isBoolean, isDefAndNotNull, isString } from 'metal';

const HANDLE_SUFFIX = '__handle__';
const LISTENER_REGEX = /^(?:on([A-Z].+))|(?:data-on(.+))$/;

/**
 * Applies an attribute to a specified element owned by the given component.
 * @param {!Component} component
 * @param {!Element} element
 * @param {string} name
 * @param {*} value
 */
export function applyAttribute(component, element, name, value) {
	const eventName = getEventFromListenerAttr_(name);
	if (eventName) {
		attachEvent_(component, element, name, eventName, value);
		return;
	}

	value = fixCheckedAttr_(name, value);
	setValueAttrAsProperty_(element, name, value);

	if (isBoolean(value)) {
		setBooleanAttr_(element, name, value);
	} else {
		getOriginalFn('attributes')(element, name, value);
	}
}

/**
 * Uses the given attribute information to attach an event to the component,
 * but only if it hasn't been attached before.
 * @param {!Component} component
 * @param {!Element} element
 * @param {string} name
 * @param {*} value
 */
export function attachFromAttrFirstTime(component, element, name, value) {
	const eventName = getEventFromListenerAttr_(name);
	if (eventName && !element[eventName + HANDLE_SUFFIX]) {
		attachEvent_(component, element, name, eventName, value);
	}
}

/**
 * Listens to the specified event, attached via incremental dom calls.
 * @param {!Component} component
 * @param {!Element} element
 * @param {string} attr
 * @param {string} eventName
 * @param {function()|string} fn
 * @private
 */
function attachEvent_(component, element, attr, eventName, fn) {
	const handleKey = eventName + HANDLE_SUFFIX;
	if (element[handleKey]) {
		element[handleKey].removeListener();
		element[handleKey] = null;
	}

	element[attr] = fn;
	if (fn) {
		if (isString(fn)) {
			if (attr[0] === 'd') {
				// Allow data-on[eventkey] listeners to stay in the dom, as they
				// won't cause conflicts.
				element.setAttribute(attr, fn);
			}
			fn = getComponentFn(component, fn);
		}
		element[handleKey] = delegate(document, eventName, element, fn);
	} else {
		element.removeAttribute(attr);
	}
}

/**
 * Changes the value of the `checked` attribute to be a boolean.
 * NOTE: This is a temporary fix to account for incremental dom setting
 * "checked" as an attribute only, which can cause bugs since that won't
 * necessarily check/uncheck the element it's set on. See
 * https://github.com/google/incremental-dom/issues/198 for more details.
 * @param {string} name
 * @param {*} value
 * @return {*}
 * @private
 */
function fixCheckedAttr_(name, value) {
	if (name === 'checked') {
		value = isDefAndNotNull(value) && value !== false;
	}
	return value;
}

/**
 * Returns the event name if the given attribute is a listener (matching the
 * `LISTENER_REGEX` regex), or null if it isn't.
 * @param {string} attr
 * @return {?string}
 * @private
 */
function getEventFromListenerAttr_(attr) {
	const matches = LISTENER_REGEX.exec(attr);
	const eventName = matches ? (matches[1] ? matches[1] : matches[2]) : null;
	return eventName ? eventName.toLowerCase() : null;
}

/**
 * Sets boolean attributes manually. This is done because incremental dom sets
 * boolean values as string data attributes by default, which is counter
 * intuitive. This changes the behavior to use the actual boolean value.
 * @param {!Element} element
 * @param {string} name
 * @param {*} value
 * @private
 */
function setBooleanAttr_(element, name, value) {
	element[name] = value;
	if (value) {
		element.setAttribute(name, '');
	} else {
		element.removeAttribute(name);
	}
}

/**
 * Sets the value of the `value` attribute directly in the element.
 * NOTE: This is a temporary fix to account for incremental dom setting "value"
 * as an attribute only, which can cause bugs since that won't necessarily
 * update the input's content it's set on. See
 * https://github.com/google/incremental-dom/issues/239 for more details. We
 * only do this if the new value is different though, as otherwise the browser
 * will automatically move the typing cursor to the end of the field.
 * @param {!Element} element
 * @param {string} name
 * @param {*} value
 * @private
 */
function setValueAttrAsProperty_(element, name, value) {
	if (name === 'value' && element.value !== value) {
		element[name] = value;
	}
}
