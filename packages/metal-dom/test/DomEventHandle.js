'use strict';

import DomEventHandle from '../src/DomEventHandle';

describe('DomEventHandle', function() {
	it('should unsubscribe listener', function() {
		let element = {
			removeEventListener: sinon.stub(),
		};
		let listener = sinon.stub();
		let handle = new DomEventHandle(element, 'event', listener);

		handle.removeListener();
		assert.strictEqual(1, element.removeEventListener.callCount);
		assert.strictEqual('event', element.removeEventListener.args[0][0]);
		assert.strictEqual(listener, element.removeEventListener.args[0][1]);
	});

	it('should unsubscribe listener attached on capture phase', function() {
		let element = {
			removeEventListener: sinon.stub(),
		};
		let listener = sinon.stub();
		let handle = new DomEventHandle(element, 'event', listener, true);

		handle.removeListener();
		assert.strictEqual(1, element.removeEventListener.callCount);
		assert.strictEqual('event', element.removeEventListener.args[0][0]);
		assert.strictEqual(listener, element.removeEventListener.args[0][1]);
		assert.ok(element.removeEventListener.args[0][2]);
	});
});
