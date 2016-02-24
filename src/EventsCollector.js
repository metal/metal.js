'use strict';

import { Disposable } from 'metal';
import { EventHandler } from 'metal-events';

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
		 * @type {!Object<string, EventHandler>}
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
	 * @param {string} fnNamesString
	 * @param {string=} groupName
	 */
	attachListener(eventType, fnNamesString, groupName = 'element') {
		var selector = '[data-on' + eventType + '="' + fnNamesString + '"]';

		this.groupHasListener_[groupName][selector] = true;

		if (!this.eventHandles_[selector]) {
			this.eventHandles_[selector] = new EventHandler();
			var fnNames = fnNamesString.split(',');
			for (var i = 0; i < fnNames.length; i++) {
				var fn = this.component_.getListenerFn(fnNames[i]);
				if (fn) {
					this.eventHandles_[selector].add(this.component_.delegate(eventType, selector, this.onEvent_.bind(this, fn)));
				}
			}
		}
	}

	/**
	 * Attaches listeners found in the given html content.
	 * @param {string} content
	 * @param {string=} groupName
	 */
	attachListenersFromHtml(content, groupName = 'element') {
		this.startCollecting(groupName);
		if (content.indexOf('data-on') === -1) {
			return;
		}
		var regex = /data-on([a-z]+)=['"]([^'"]+)['"]/g;
		var match = regex.exec(content);
		while (match) {
			this.attachListener(match[1], match[2], groupName);
			match = regex.exec(content);
		}
	}

	/**
	 * Removes all previously attached event listeners to the component.
	 */
	detachAllListeners() {
		for (var selector in this.eventHandles_) {
			if (this.eventHandles_[selector]) {
				this.eventHandles_[selector].removeAllListeners();
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
			if (this.eventHandles_[selector]) {
				var unused = true;
				for (var groupName in this.groupHasListener_) {
					if (this.groupHasListener_[groupName][selector]) {
						unused = false;
						break;
					}
				}
				if (unused) {
					this.eventHandles_[selector].removeAllListeners();
					this.eventHandles_[selector] = null;
				}
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
	 * Checks if this EventsCollector instance has already attached listeners for the given
	 * group before.
	 * @param  {string} group
	 * @return {boolean}
	 */
	hasAttachedForGroup(group) {
		return !!this.groupHasListener_.hasOwnProperty(group);
	}

	/**
	 * Fires when an event that was registered by this collector is triggered. Makes
	 * sure that the event was meant for this component and calls the appropriate
	 * listener function for it.
	 * @param {!function(!Object)} fn
	 * @param {!Object} event
	 * @return {*} The return value of the call to the listener function, or undefined
	 *   if no function was called.
	 * @protected
	 */
	onEvent_(fn, event) {
		// This check prevents parent components from handling their child inline listeners.
		var eventComp = event.handledByComponent;
		if (!eventComp || eventComp === this.component_ || event.delegateTarget.contains(eventComp.element)) {
			event.handledByComponent = this.component_;
			return fn(event);
		}
	}

	/**
	 * Prepares the collector to start collecting listeners for the given group.
	 * Should be called before all calls to `attachListener` for that group.
	 */
	startCollecting(groupName = 'element') {
		this.groupHasListener_[groupName] = {};
	}
}

export default EventsCollector;
