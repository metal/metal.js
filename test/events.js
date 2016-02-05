'use strict';

import EventEmitter from '../src/EventEmitter';
import EventEmitterProxy from '../src/EventEmitterProxy';
import EventHandle from '../src/EventHandle';
import EventHandler from '../src/EventHandler';
import events from '../src/events';
import * as namedImports from '../src/events';

describe('events', function() {
	it('should export EventEmitter by default', function() {
		assert.strictEqual(EventEmitter, events);
	});

	it('should export all inner classes by name', function() {
		assert.strictEqual(EventEmitter, namedImports.EventEmitter);
		assert.strictEqual(EventEmitterProxy, namedImports.EventEmitterProxy);
		assert.strictEqual(EventHandle, namedImports.EventHandle);
		assert.strictEqual(EventHandler, namedImports.EventHandler);
	});
});
