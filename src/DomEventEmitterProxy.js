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
	 * Adds the proxy listener for the given event.
	 * @param {string} event.
	 * @protected
	 * @override
	 */
	addListener_(event) {
		if (this.originEmitter_.addEventListener) {
			dom.on(this.originEmitter_, event, this.proxiedEvents_[event]);
		} else {
			super.addListener_(event);
		}
	}

	/**
	 * Removes the proxy listener for the given event.
	 * @param {string} event
	 * @protected
	 * @override
	 */
	removeListener_(event) {
		if (this.originEmitter_.removeEventListener) {
			this.originEmitter_.removeEventListener(event, this.proxiedEvents_[event]);
		} else {
			super.removeListener_(event);
		}
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
			(!this.originEmitter_.addEventListener || dom.supportsEvent(this.originEmitter_, event));
	}
}

export default DomEventEmitterProxy;
