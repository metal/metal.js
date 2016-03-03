'use strict';

import dom from './dom';
import { EventEmitterProxy } from 'metal-events';

/**
 * DomEventEmitterProxy utility. It extends `EventEmitterProxy` to also accept
 * dom elements as origin emitters.
 * @extends {EventEmitterProxy}
 */
class DomEventEmitterProxy extends EventEmitterProxy {
	/**
	 * Adds the given listener for the given event.
	 * @param {string} event.
	 * @param {!function()} listener
	 * @return {!EventHandle} The listened event's handle.
	 * @protected
	 * @override
	 */
	addListener_(event, listener) {
		if (this.originEmitter_.addEventListener) {
			if (event.startsWith('delegate:')) {
				var index = event.indexOf(':', 9);
				var eventName = event.substring(9, index);
				var selector = event.substring(index + 1);
				return dom.delegate(this.originEmitter_, eventName, selector, listener);
			} else {
				return dom.on(this.originEmitter_, event, listener);
			}
		} else {
			return super.addListener_(event, listener);
		}
	}

	/**
	 * Checks if the given event is supported by the origin element.
	 * @param {string} event
	 * @protected
	 */
	isSupportedDomEvent_(event) {
		return (event.startsWith('delegate:') && event.indexOf(':', 9) !== -1) ||
			dom.supportsEvent(this.originEmitter_, event);
	}

	/**
	 * Checks if the given event should be proxied.
	 * @param {string} event
	 * @return {boolean}
	 * @protected
	 * @override
	 */
	shouldProxyEvent_(event) {
		return super.shouldProxyEvent_(event) &&
			(!this.originEmitter_.addEventListener || this.isSupportedDomEvent_(event));
	}
}

export default DomEventEmitterProxy;
