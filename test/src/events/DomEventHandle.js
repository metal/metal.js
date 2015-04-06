'use strict';

import DomEventHandle from '../../../src/events/DomEventHandle';

describe('DomEventHandle', function() {
	it('should unsubscribe the listener', function() {
		var element = {
			removeEventListener: sinon.stub()
		};
		var listener = sinon.stub();
		var handle = new DomEventHandle(element, 'event', listener);

		handle.removeListener();
		assert.strictEqual(1, element.removeEventListener.callCount);
		assert.strictEqual('event', element.removeEventListener.args[0][0]);
		assert.strictEqual(listener, element.removeEventListener.args[0][1]);
	});
});
