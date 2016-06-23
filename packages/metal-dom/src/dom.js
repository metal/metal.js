'use strict';

import { core, object } from 'metal';
import metalData from './metalData';
import DomDelegatedEventHandle from './DomDelegatedEventHandle';
import DomEventHandle from './DomEventHandle';

const NEXT_TARGET = '__metal_next_target__';
const USE_CAPTURE = {
	blur: true,
	error: true,
	focus: true,
	invalid: true,
	load: true,
	scroll: true
};

class dom {
	/**
	 * Adds the requested CSS classes to an element.
	 * @param {!Element} element The element to add CSS classes to.
	 * @param {string} classes CSS classes to add.
	 */
	static addClasses(element, classes) {
		if (!core.isObject(element) || !core.isString(classes)) {
			return;
		}

		if ('classList' in element) {
			dom.addClassesWithNative_(element, classes);
		} else {
			dom.addClassesWithoutNative_(element, classes);
		}
	}

	/**
	 * Adds the requested CSS classes to an element using classList.
	 * @param {!Element} element The element to add CSS classes to.
	 * @param {string} classes CSS classes to add.
	 * @protected
	 */
	static addClassesWithNative_(element, classes) {
		classes.split(' ').forEach(function(className) {
			if (className) {
				element.classList.add(className);
			}
		});
	}

	/**
	 * Adds the requested CSS classes to an element without using classList.
	 * @param {!Element} element The element to add CSS classes to.
	 * @param {string} classes CSS classes to add.
	 * @protected
	 */
	static addClassesWithoutNative_(element, classes) {
		var elementClassName = ' ' + element.className + ' ';
		var classesToAppend = '';

		classes = classes.split(' ');

		for (var i = 0; i < classes.length; i++) {
			var className = classes[i];

			if (elementClassName.indexOf(' ' + className + ' ') === -1) {
				classesToAppend += ' ' + className;
			}
		}

		if (classesToAppend) {
			element.className = element.className + classesToAppend;
		}
	}

	/**
	 * Adds an event listener to the given element, to be triggered via delegate.
	 * @param {!Element} element
	 * @param {string} eventName
	 * @param {!function()} listener
	 * @protected
	 */
	static addElementListener_(element, eventName, listener) {
		var data = metalData.get(element);
		dom.addToArr_(data.listeners, eventName, listener);
	}

	/**
	 * Adds an event listener to the given element, to be triggered via delegate
	 * selectors.
	 * @param {!Element} element
	 * @param {string} eventName
	 * @param {string} selector
	 * @param {!function()} listener
	 * @protected
	 */
	static addSelectorListener_(element, eventName, selector, listener) {
		var data = metalData.get(element);
		dom.addToArr_(data.delegating[eventName].selectors, selector, listener);
	}

	/**
	 * Adds a value to an array inside an object, creating it first if it doesn't
	 * yet exist.
	 * @param {!Array} arr
	 * @param {string} key
	 * @param {*} value
	 * @protected
	 */
	static addToArr_(arr, key, value) {
		if (!arr[key]) {
			arr[key] = [];
		}
		arr[key].push(value);
	}

	/**
	 * Attaches a delegate listener, unless there's already one attached.
	 * @param {!Element} element
	 * @param {string} eventName
	 * @protected
	 */
	static attachDelegateEvent_(element, eventName) {
		var data = metalData.get(element);
		if (!data.delegating[eventName]) {
			data.delegating[eventName] = {
				handle: dom.on(
					element,
					eventName,
					dom.handleDelegateEvent_,
					!!USE_CAPTURE[eventName]
				),
				selectors: {}
			};
		}
	}

	/**
	 * Gets the closest element up the tree from the given element (including
	 * itself) that matches the specified selector, or null if none match.
	 * @param {Element} element
	 * @param {string} selector
	 * @return {Element}
	 */
	static closest(element, selector) {
		while (element && !dom.match(element, selector)) {
			element = element.parentNode;
		}
		return element;
	}

	/**
	 * Appends a child node with text or other nodes to a parent node. If
	 * child is a HTML string it will be automatically converted to a document
	 * fragment before appending it to the parent.
	 * @param {!Element} parent The node to append nodes to.
	 * @param {!(Element|NodeList|string)} child The thing to append to the parent.
	 * @return {!Element} The appended child.
	 */
	static append(parent, child) {
		if (core.isString(child)) {
			child = dom.buildFragment(child);
		}
		if (child instanceof NodeList) {
			var childArr = Array.prototype.slice.call(child);
			for (var i = 0; i < childArr.length; i++) {
				parent.appendChild(childArr[i]);
			}
		} else {
			parent.appendChild(child);
		}
		return child;
	}

	/**
	 * Helper for converting a HTML string into a document fragment.
	 * @param {string} htmlString The HTML string to convert.
	 * @return {!Element} The resulting document fragment.
	 */
	static buildFragment(htmlString) {
		var tempDiv = document.createElement('div');
		tempDiv.innerHTML = '<br>' + htmlString;
		tempDiv.removeChild(tempDiv.firstChild);

		var fragment = document.createDocumentFragment();
		while (tempDiv.firstChild) {
			fragment.appendChild(tempDiv.firstChild);
		}
		return fragment;
	}

	/**
	 * Checks if the first element contains the second one.
	 * @param {!Element} element1
	 * @param {!Element} element2
	 * @return {boolean}
	 */
	static contains(element1, element2) {
		if (core.isDocument(element1)) {
			// document.contains is not defined on IE9, so call it on documentElement instead.
			return element1.documentElement.contains(element2);
		} else {
			return element1.contains(element2);
		}
	}

	/**
	 * Listens to the specified event on the given DOM element, but only calls the
	 * given callback listener when it's triggered by elements that match the
	 * given selector or target element.
	 * @param {!Element} element The DOM element the event should be listened on.
	 * @param {string} eventName The name of the event to listen to.
	 * @param {!Element|string} selectorOrTarget Either an element or css selector
	 *     that should match the event for the listener to be triggered.
	 * @param {!function(!Object)} callback Function to be called when the event
	 *     is triggered. It will receive the normalized event object.
	 * @param {boolean=} opt_default Optional flag indicating if this is a default
	 *     listener. That means that it would only be executed after all non
	 *     default listeners, and only if the event isn't prevented via
	 *     `preventDefault`.
	 * @return {!EventHandle} Can be used to remove the listener.
	 */
	static delegate(element, eventName, selectorOrTarget, callback, opt_default) {
		var customConfig = dom.customEvents[eventName];
		if (customConfig && customConfig.delegate) {
			eventName = customConfig.originalEvent;
			callback = customConfig.handler.bind(customConfig, callback);
		}

		if (opt_default) {
			// Wrap callback so we don't set property directly on it.
			callback = callback.bind();
			callback.defaultListener_ = true;
		}

		dom.attachDelegateEvent_(element, eventName);
		if (core.isString(selectorOrTarget)) {
			dom.addSelectorListener_(element, eventName, selectorOrTarget, callback);
		} else {
			dom.addElementListener_(selectorOrTarget, eventName, callback);
		}

		return new DomDelegatedEventHandle(
			core.isString(selectorOrTarget) ? element : selectorOrTarget,
			eventName,
			callback,
			core.isString(selectorOrTarget) ? selectorOrTarget : null
		);
	}

	/**
	 * Inserts node in document as last element.
	 * @param {Element} node Element to remove children from.
	 */
	static enterDocument(node) {
		node && dom.append(document.body, node);
	}

	/**
	 * Removes node from document.
	 * @param {Element} node Element to remove children from.
	 */
	static exitDocument(node) {
		if (node && node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * This is called when an event is triggered by a delegate listener. All
	 * matching listeners of this event type from `target` to `currentTarget` will
	 * be triggered.
	 * @param {!Event} event The event payload.
	 * @return {boolean} False if at least one of the triggered callbacks returns
	 *     false, or true otherwise.
	 * @protected
	 */
	static handleDelegateEvent_(event) {
		dom.normalizeDelegateEvent_(event);
		var currElement = core.isDef(event[NEXT_TARGET]) ?
			event[NEXT_TARGET] :
			event.target;
		var ret = true;
		var container = event.currentTarget;
		var limit = event.currentTarget.parentNode;
		var defFns = [];

		while (currElement && currElement !== limit && !event.stopped) {
			event.delegateTarget = currElement;
			ret &= dom.triggerMatchedListeners_(container, currElement, event, defFns);
			currElement = currElement.parentNode;
		}

		for (var i = 0; i < defFns.length && !event.defaultPrevented; i++) {
			event.delegateTarget = defFns[i].element;
			ret &= defFns[i].fn(event);
		}

		event.delegateTarget = null;
		event[NEXT_TARGET] = limit;
		return ret;
	}

	/**
	 * Checks if the given element has the requested css class.
	 * @param {!Element} element
	 * @param {string} className
	 * @return {boolean}
	 */
	static hasClass(element, className) {
		if ('classList' in element) {
			return dom.hasClassWithNative_(element, className);
		} else {
			return dom.hasClassWithoutNative_(element, className);
		}
	}

	/**
	 * Checks if the given element has the requested css class using classList.
	 * @param {!Element} element
	 * @param {string} className
	 * @return {boolean}
	 * @protected
	 */
	static hasClassWithNative_(element, className) {
		return element.classList.contains(className);
	}

	/**
	 * Checks if the given element has the requested css class without using classList.
	 * @param {!Element} element
	 * @param {string} className
	 * @return {boolean}
	 * @protected
	 */
	static hasClassWithoutNative_(element, className) {
		return (' ' + element.className + ' ').indexOf(' ' + className + ' ') >= 0;
	}

	/**
	 * Checks if the given element is empty or not.
	 * @param {!Element} element
	 * @return {boolean}
	 */
	static isEmpty(element) {
		return element.childNodes.length === 0;
	}

	/**
	 * Check if an element matches a given selector.
	 * @param {Element} element
	 * @param {string} selector
	 * @return {boolean}
	 */
	static match(element, selector) {
		if (!element || element.nodeType !== 1) {
			return false;
		}

		var p = Element.prototype;
		var m = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector;
		if (m) {
			return m.call(element, selector);
		}

		return dom.matchFallback_(element, selector);
	}

	/**
	 * Check if an element matches a given selector, using an internal implementation
	 * instead of calling existing javascript functions.
	 * @param {Element} element
	 * @param {string} selector
	 * @return {boolean}
	 * @protected
	 */
	static matchFallback_(element, selector) {
		var nodes = document.querySelectorAll(selector, element.parentNode);
		for (var i = 0; i < nodes.length; ++i) {
			if (nodes[i] === element) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Returns the next sibling of the given element that matches the specified
	 * selector, or null if there is none.
	 * @param {!Element} element
	 * @param {?string} selector
	 */
	static next(element, selector) {
		do {
			element = element.nextSibling;
			if (element && dom.match(element, selector)) {
				return element;
			}
		} while (element);
		return null;
	}

	/**
	 * Normalizes the event payload for delegate listeners.
	 * @param {!Event} event
	 */
	static normalizeDelegateEvent_(event) {
		event.stopPropagation = dom.stopPropagation_;
		event.stopImmediatePropagation = dom.stopImmediatePropagation_;
	}

	/**
	 * Listens to the specified event on the given DOM element. This function normalizes
	 * DOM event payloads and functions so they'll work the same way on all supported
	 * browsers.
	 * @param {!Element|string} element The DOM element to listen to the event on, or
	 *   a selector that should be delegated on the entire document.
	 * @param {string} eventName The name of the event to listen to.
	 * @param {!function(!Object)} callback Function to be called when the event is
	 *   triggered. It will receive the normalized event object.
	 * @param {boolean} opt_capture Flag indicating if listener should be triggered
	 *   during capture phase, instead of during the bubbling phase. Defaults to false.
	 * @return {!DomEventHandle} Can be used to remove the listener.
	 */
	static on(element, eventName, callback, opt_capture) {
		if (core.isString(element)) {
			return dom.delegate(document, eventName, element, callback);
		}
		var customConfig = dom.customEvents[eventName];
		if (customConfig && customConfig.event) {
			eventName = customConfig.originalEvent;
			callback = customConfig.handler.bind(customConfig, callback);
		}
		element.addEventListener(eventName, callback, opt_capture);
		return new DomEventHandle(element, eventName, callback, opt_capture);
	}

	/**
	 * Listens to the specified event on the given DOM element once. This
	 * function normalizes DOM event payloads and functions so they'll work the
	 * same way on all supported browsers.
	 * @param {!Element} element The DOM element to listen to the event on.
	 * @param {string} eventName The name of the event to listen to.
	 * @param {!function(!Object)} callback Function to be called when the event
	 *   is triggered. It will receive the normalized event object.
	 * @return {!DomEventHandle} Can be used to remove the listener.
	 */
	static once(element, eventName, callback) {
		var domEventHandle = this.on(element, eventName, function() {
			domEventHandle.removeListener();
			return callback.apply(this, arguments);
		});
		return domEventHandle;
	}

	/**
	 * Gets the first parent from the given element that matches the specified
	 * selector, or null if none match.
	 * @param {!Element} element
	 * @param {string} selector
	 * @return {Element}
	 */
	static parent(element, selector) {
		return dom.closest(element.parentNode, selector);
	}

	/**
	 * Registers a custom event.
	 * @param {string} eventName The name of the custom event.
	 * @param {!Object} customConfig An object with information about how the event
	 *   should be handled.
	 */
	static registerCustomEvent(eventName, customConfig) {
		dom.customEvents[eventName] = customConfig;
	}

	/**
	 * Removes all the child nodes on a DOM node.
	 * @param {Element} node Element to remove children from.
	 */
	static removeChildren(node) {
		var child;
		while ((child = node.firstChild)) {
			node.removeChild(child);
		}
	}

	/**
	 * Removes the requested CSS classes from an element.
	 * @param {!Element} element The element to remove CSS classes from.
	 * @param {string} classes CSS classes to remove.
	 */
	static removeClasses(element, classes) {
		if (!core.isObject(element) || !core.isString(classes)) {
			return;
		}

		if ('classList' in element) {
			dom.removeClassesWithNative_(element, classes);
		} else {
			dom.removeClassesWithoutNative_(element, classes);
		}
	}

	/**
	 * Removes the requested CSS classes from an element using classList.
	 * @param {!Element} element The element to remove CSS classes from.
	 * @param {string} classes CSS classes to remove.
	 * @protected
	 */
	static removeClassesWithNative_(element, classes) {
		classes.split(' ').forEach(function(className) {
			if (className) {
				element.classList.remove(className);
			}
		});
	}

	/**
	 * Removes the requested CSS classes from an element without using classList.
	 * @param {!Element} element The element to remove CSS classes from.
	 * @param {string} classes CSS classes to remove.
	 * @protected
	 */
	static removeClassesWithoutNative_(element, classes) {
		var elementClassName = ' ' + element.className + ' ';

		classes = classes.split(' ');

		for (var i = 0; i < classes.length; i++) {
			elementClassName = elementClassName.replace(' ' + classes[i] + ' ', ' ');
		}

		element.className = elementClassName.trim();
	}

	/**
	 * Replaces the first element with the second.
	 * @param {Element} element1
	 * @param {Element} element2
	 */
	static replace(element1, element2) {
		if (element1 && element2 && element1 !== element2 && element1.parentNode) {
			element1.parentNode.insertBefore(element2, element1);
			element1.parentNode.removeChild(element1);
		}
	}

	/**
	 * The function that replaces `stopImmediatePropagation_` for events.
	 * @protected
	 */
	static stopImmediatePropagation_() {
		this.stopped = true;
		this.stoppedImmediate = true;
		Event.prototype.stopImmediatePropagation.call(this);
	}

	/**
	 * The function that replaces `stopPropagation` for events.
	 * @protected
	 */
	static stopPropagation_() {
		this.stopped = true;
		Event.prototype.stopPropagation.call(this);
	}

	/**
	 * Checks if the given element supports the given event type.
	 * @param {!Element|string} element The DOM element or element tag name to check.
	 * @param {string} eventName The name of the event to check.
	 * @return {boolean}
	 */
	static supportsEvent(element, eventName) {
		if (dom.customEvents[eventName]) {
			return true;
		}

		if (core.isString(element)) {
			if (!elementsByTag[element]) {
				elementsByTag[element] = document.createElement(element);
			}
			element = elementsByTag[element];
		}
		return 'on' + eventName in element;
	}

	/**
	 * Converts the given argument to a DOM element. Strings are assumed to
	 * be selectors, and so a matched element will be returned. If the arg
	 * is already a DOM element it will be the return value.
	 * @param {string|Element|Document} selectorOrElement
	 * @return {Element} The converted element, or null if none was found.
	 */
	static toElement(selectorOrElement) {
		if (core.isElement(selectorOrElement) || core.isDocument(selectorOrElement)) {
			return selectorOrElement;
		} else if (core.isString(selectorOrElement)) {
			if (selectorOrElement[0] === '#' && selectorOrElement.indexOf(' ') === -1) {
				return document.getElementById(selectorOrElement.substr(1));
			} else {
				return document.querySelector(selectorOrElement);
			}
		} else {
			return null;
		}
	}

	/**
	 * Adds or removes one or more classes from an element. If any of the classes
	 * is present, it will be removed from the element, or added otherwise.
	 * @param {!Element} element The element which classes will be toggled.
	 * @param {string} classes The classes which have to added or removed from the element.
	 */
	static toggleClasses(element, classes) {
		if (!core.isObject(element) || !core.isString(classes)) {
			return;
		}

		if ('classList' in element) {
			dom.toggleClassesWithNative_(element, classes);
		} else {
			dom.toggleClassesWithoutNative_(element, classes);
		}
	}

	/**
	 * Adds or removes one or more classes from an element using classList.
	 * If any of the classes is present, it will be removed from the element,
	 * or added otherwise.
	 * @param {!Element} element The element which classes will be toggled.
	 * @param {string} classes The classes which have to added or removed from the element.
	 */
	static toggleClassesWithNative_(element, classes) {
		classes.split(' ').forEach(function(className) {
			element.classList.toggle(className);
		});
	}

	/**
	 * Adds or removes one or more classes from an element without using classList.
	 * If any of the classes is present, it will be removed from the element,
	 * or added otherwise.
	 * @param {!Element} element The element which classes will be toggled.
	 * @param {string} classes The classes which have to added or removed from the element.
	 */
	static toggleClassesWithoutNative_(element, classes) {
		var elementClassName = ' ' + element.className + ' ';

		classes = classes.split(' ');

		for (var i = 0; i < classes.length; i++) {
			var className = ' ' + classes[i] + ' ';
			var classIndex = elementClassName.indexOf(className);

			if (classIndex === -1) {
				elementClassName = elementClassName + classes[i] + ' ';
			} else {
				elementClassName = elementClassName.substring(0, classIndex) + ' ' +
					elementClassName.substring(classIndex + className.length);
			}
		}

		element.className = elementClassName.trim();
	}

	/**
	 * Triggers the specified event on the given element.
	 * NOTE: This should mostly be used for testing, not on real code.
	 * @param {!Element} element The node that should trigger the event.
	 * @param {string} eventName The name of the event to be triggred.
	 * @param {Object=} opt_eventObj An object with data that should be on the
	 *   triggered event's payload.
	 */
	static triggerEvent(element, eventName, opt_eventObj) {
		var eventObj = document.createEvent('HTMLEvents');
		eventObj.initEvent(eventName, true, true);
		object.mixin(eventObj, opt_eventObj);
		element.dispatchEvent(eventObj);
	}

	/**
	 * Triggers the given listeners array.
	 * @param {Array<!function()} listeners
	 * @param {!Event} event
	 * @param {!Element} element
	 * @param {!Array} defaultFns Array to collect default listeners in, instead
	 *     of running them.
	 * @return {boolean} False if at least one of the triggered callbacks returns
	 *     false, or true otherwise.
	 * @protected
	 */
	static triggerListeners_(listeners, event, element, defaultFns) {
		var ret = true;
		listeners = listeners || [];
		for (var i = 0; i < listeners.length && !event.stoppedImmediate; i++) {
			if (listeners[i].defaultListener_) {
				defaultFns.push({
					element,
					fn: listeners[i]
				});
			} else {
				ret &= listeners[i](event);
			}
		}
		return ret;
	}

	/**
	 * Triggers all listeners for the given event type that are stored in the
	 * specified element.
	 * @param {!Element} container
	 * @param {!Element} element
	 * @param {!Event} event
	 * @param {!Array} defaultFns Array to collect default listeners in, instead
	 *     of running them.
	 * @return {boolean} False if at least one of the triggered callbacks returns
	 *     false, or true otherwise.
	 * @protected
	 */
	static triggerMatchedListeners_(container, element, event, defaultFns) {
		var data = metalData.get(element);
		var listeners = data.listeners[event.type];
		var ret = dom.triggerListeners_(listeners, event, element, defaultFns);

		var selectorsMap = metalData.get(container).delegating[event.type].selectors;
		var selectors = Object.keys(selectorsMap);
		for (var i = 0; i < selectors.length && !event.stoppedImmediate; i++) {
			if (dom.match(element, selectors[i])) {
				listeners = selectorsMap[selectors[i]];
				ret &= dom.triggerListeners_(listeners, event, element, defaultFns);
			}
		}

		return ret;
	}
}

var elementsByTag = {};
dom.customEvents = {};

export default dom;
