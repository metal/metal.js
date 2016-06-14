'use strict';

import { array } from 'metal';
import metalData from './metalData';
import { EventHandle } from 'metal-events';

/**
 * This is a special EventHandle, that is responsible for dom delegated events
 * (only the ones that receive a target element, not a selector string).
 * @extends {EventHandle}
 */
class DomDelegatedEventHandle extends EventHandle {
	/**
	 * @inheritDoc
	 */
	removeListener() {
		var data = metalData.get(this.emitter_);
		array.remove(data.listeners[this.event_] || [], this.listener_);
	}
}

export default DomDelegatedEventHandle;
