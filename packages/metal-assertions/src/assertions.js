import {
	isBoolean,
	isDef,
	isDefAndNotNull,
	isDocument,
	isDocumentFragment,
	isElement,
	isFunction,
	isNull,
	isNumber,
	isObject,
	isString,
	isWindow,
} from 'metal';

/**
 * Asserts value is a boolean.
 * @param  {*} value
 * @param  {string} errorMessage Error message
 */
export function assertBoolean(value, errorMessage) {
	if (!isBoolean(value)) {
		throw new Error(errorMessage);
	}
}

/**
 * Asserts value is defined.
 * @param  {Object} value
 * @param  {string} errorMessage Error message
 */
export function assertDef(value, errorMessage) {
	if (!isDef(value)) {
		throw new Error(errorMessage);
	}
}

/**
 * Asserts value is defined and not null.
 * @param  {Object} value
 * @param  {string} errorMessage Error message
 */
export function assertDefAndNotNull(value, errorMessage) {
	if (!isDefAndNotNull(value)) {
		throw new Error(errorMessage);
	}
}

/**
 * Asserts value is a function.
 * @param  {Function} value
 * @param  {string} errorMessage Error message
 */
export function assertFunction(value, errorMessage) {
	if (!isFunction(value)) {
		throw new Error(errorMessage);
	}
}

/**
 * Asserts value is not null.
 * @param  {Object} value
 * @param  {string} errorMessage Error message
 */
export function assertNotNull(value, errorMessage) {
	if (isNull(value)) {
		throw new Error(errorMessage);
	}
}

/**
 * Asserts value is a number.
 * @param  {Number} value
 * @param  {string} errorMessage Error message
 */
export function assertNumber(value, errorMessage) {
	if (!isNumber(value)) {
		throw new Error(errorMessage);
	}
}

/**
 * Asserts value is an object.
 * @param  {Object} value
 * @param  {string} errorMessage Error message
 */
export function assertObject(value, errorMessage) {
	if (!isObject(value)) {
		throw new Error(errorMessage);
	}
}

/**
 * Asserts value is a string.
 * @param  {String} value
 * @param  {string} errorMessage Error message
 */
export function assertString(value, errorMessage) {
	if (!isString(value)) {
		throw new Error(errorMessage);
	}
}

/**
 * Asserts value is a document.
 * @param  {Document} value
 * @param  {string} errorMessage Error message
 */
export function assertDocument(value, errorMessage) {
	if (!isDocument(value)) {
		throw new Error(errorMessage);
	}
}

/**
 * Asserts value is a document fragment.
 * @param  {DocumentFragment} value
 * @param  {string} errorMessage Error message
 */
export function assertDocumentFragment(value, errorMessage) {
	if (!isDocumentFragment(value)) {
		throw new Error(errorMessage);
	}
}

/**
 * Asserts value is an element.
 * @param  {Element} value
 * @param  {string} errorMessage Error message
 */
export function assertElement(value, errorMessage) {
	if (!isElement(value)) {
		throw new Error(errorMessage);
	}
}

/**
 * Asserts value is a window.
 * @param  {Window} value
 * @param  {string} errorMessage Error message
 */
export function assertWindow(value, errorMessage) {
	if (!isWindow(value)) {
		throw new Error(errorMessage);
	}
}
