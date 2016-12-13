'use strict';

import { delegate, on, supportsEvent } from './dom';
import { EventEmitterProxy } from 'metal-events';

/**
 * DomEventEmitterProxy utility. It extends `EventEmitterProxy` to also accept
 * dom elements as origin emitters.
 * @extends {EventEmitterProxy}
 */
class DomEventEmitterProxy extends EventEmitterProxy {
	/**
	 * Adds the given listener for the given event.
	 * @param {string} event
	 * @param {!function()} listener
	 * @return {!EventHandle} The listened event's handle.
	 * @protected
	 * @override
	 */
	addListener_(event, listener) {
		if (this.originEmitter_.addEventListener) {
			if (this.isDelegateEvent_(event)) {
				const index = event.indexOf(':', 9);
				const eventName = event.substring(9, index);
				const selector = event.substring(index + 1);
				return delegate(this.originEmitter_, eventName, selector, listener);
			} else {
				return on(this.originEmitter_, event, listener);
			}
		} else {
			return super.addListener_(event, listener);
		}
	}

	/**
	 * Checks if the given event is of the delegate type.
	 * @param {string} event
	 * @return {boolean}
	 * @protected
	 */
	isDelegateEvent_(event) {
		return event.substr(0, 9) === 'delegate:';
	}

	/**
	 * Checks if the given event is supported by the origin element.
	 * @param {string} event
	 * @protected
	 */
	isSupportedDomEvent_(event) {
		if (!this.originEmitter_ || !this.originEmitter_.addEventListener) {
			return true;
		}
		return (this.isDelegateEvent_(event) && event.indexOf(':', 9) !== -1) ||
			supportsEvent(this.originEmitter_, event);
	}

	/**
	 * Checks if the given event should be proxied.
	 * @param {string} event
	 * @return {boolean}
	 * @protected
	 * @override
	 */
	shouldProxyEvent_(event) {
		return super.shouldProxyEvent_(event) && this.isSupportedDomEvent_(event);
	}
}

export default DomEventEmitterProxy;
