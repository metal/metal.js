'use strict';

import core from '../core';
import ComponentCollector from '../component/ComponentCollector';
import Disposable from '../disposable/Disposable';

/**
 * Collects inline events from a passed element, detaching previously
 * attached events that are not being used anymore.
 * @param {Component} component
 * @constructor
 * @extends {Disposable}
 */
class EventsCollector extends Disposable {
	constructor(component) {
		super();

		if (!component) {
			throw new Error('The component instance is mandatory');
		}

		/**
		 * Holds the component intance.
		 * @type {!Component}
		 * @protected
		 */
		this.component_ = component;

		/**
		 * Holds the attached delegate event handles, indexed by the css selector.
		 * @type {!Object<string, !DomEventHandle>}
		 * @protected
		 */
		this.eventHandles_ = {};

		/**
		 * Holds flags indicating which selectors a group has listeners for.
		 * @type {!Object<string, !Object<string, boolean>>}
		 * @protected
		 */
		this.groupHasListener_ = {};
	}

	/**
	 * Attaches the listener described by the given params, unless it has already
	 * been attached.
	 * @param {string} eventType
	 * @param {string} fnName
	 * @param {boolean} permanent
	 * @protected
	 */
	attachListener_(eventType, fnName, groupName) {
		var selector = '[data-on' + eventType + '="' + fnName + '"]';

		this.groupHasListener_[groupName][selector] = true;

		if (!this.eventHandles_[selector]) {
			var fn = this.getListenerFn_(fnName);
			this.eventHandles_[selector] = this.component_.delegate(eventType, selector, fn);
		}
	}

	/**
	 * Attaches all listeners declared as attributes on the given element and
	 * its children.
	 * @param {string} content
	 * @param {boolean} groupName
	 */
	attachListeners(content, groupName) {
		if (!core.isString(content)) {
			return;
		}
		this.groupHasListener_[groupName] = {};
		this.attachListenersFromHtml_(content, groupName);
	}

	/**
	 * Attaches listeners found in the given html content.
	 * @param {string} content
	 * @param {boolean} groupName
	 * @protected
	 */
	attachListenersFromHtml_(content, groupName) {
		if (content.indexOf('data-on') === -1) {
			return;
		}
		var regex = /data-on([a-z]+)=['"]([^'"]+)['"]/g;
		var match = regex.exec(content);
		while (match) {
			this.attachListener_(match[1], match[2], groupName);
			match = regex.exec(content);
		}
	}

	/**
	 * Removes all previously attached event listeners to the component.
	 */
	detachAllListeners() {
		for (var selector in this.eventHandles_) {
			if (this.eventHandles_[selector]) {
				this.eventHandles_[selector].removeListener();
			}
		}
		this.eventHandles_ = {};
		this.listenerCounts_ = {};
	}

	/**
	 * Detaches all existing listeners that are not being used anymore.
	 * @protected
	 */
	detachUnusedListeners() {
		for (var selector in this.eventHandles_) {
			var unused = true;
			for (var groupName in this.groupHasListener_) {
				if (this.groupHasListener_[groupName][selector]) {
					unused = false;
					break;
				}
			}
			if (unused) {
				this.eventHandles_[selector].removeListener();
				this.eventHandles_[selector] = null;
			}
		}
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		this.detachAllListeners();
		this.component_ = null;
	}

	/**
	 * Gets the listener function from its name. If the name is prefixed with a
	 * component id, the function will be called on that specified component. Otherwise
	 * it will be called on this event collector's component instead.
	 * @param {string} fnName
	 * @return {!function()}
	 * @protected
	 */
	getListenerFn_(fnName) {
		var fnComponent;
		var split = fnName.split(':');
		if (split.length === 2) {
			fnName = split[1];
			fnComponent = ComponentCollector.components[split[0]];
			if (!fnComponent) {
				console.error('No component with the id ' + split[0] + ' has been collected' +
					'yet. Make sure that you specify an id for an existing component when ' +
					'adding inline listeners.'
				);
			}
		}
		fnComponent = fnComponent || this.component_;
		return fnComponent[fnName].bind(fnComponent);
	}
}

export default EventsCollector;
