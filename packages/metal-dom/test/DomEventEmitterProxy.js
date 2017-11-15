'use strict';

import dom from '../src/dom';
import features from '../src/features';
import DomEventEmitterProxy from '../src/DomEventEmitterProxy';
import {EventEmitter} from 'metal-events';

describe('DomEventEmitterProxy', function() {
	afterEach(function() {
		document.body.innerHTML = '';
	});

	it('should proxy event from event emitter origin to target', function() {
		let origin = new EventEmitter();
		let target = new EventEmitter();
		new DomEventEmitterProxy(origin, target);

		let listener = sinon.stub();
		target.on('event1', listener);
		origin.emit('event1', 1, 2);

		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(1, listener.args[0][0]);
		assert.strictEqual(2, listener.args[0][1]);
	});

	it('should proxy event from dom element origin to target', function() {
		let origin = document.createElement('div');
		document.body.appendChild(origin);

		let target = new EventEmitter();
		new DomEventEmitterProxy(origin, target);

		let listener = sinon.stub();
		target.on('click', listener);
		dom.triggerEvent(origin, 'click');

		assert.strictEqual(1, listener.callCount);
		assert.ok(listener.args[0][0]);
		document.body.removeChild(origin);
	});

	it('should proxy custom event from dom element origin to target', function() {
		let origin = document.createElement('div');
		document.body.appendChild(origin);

		let target = new EventEmitter();
		new DomEventEmitterProxy(origin, target);

		let listener = sinon.stub();
		target.on('transitionend', listener);
		dom.triggerEvent(origin, features.checkAnimationEventName().transition);

		assert.strictEqual(1, listener.callCount);
	});

	it('should not proxy unsupported dom event from dom element', function() {
		let origin = document.createElement('div');
		origin.addEventListener = sinon.stub();

		let target = new EventEmitter();
		new DomEventEmitterProxy(origin, target);

		target.on('event1', sinon.stub());
		assert.strictEqual(0, origin.addEventListener.callCount);
	});

	it('should proxy event from document to target', function() {
		let target = new EventEmitter();
		new DomEventEmitterProxy(document, target);

		let listener = sinon.stub();
		target.on('click', listener);
		dom.triggerEvent(document, 'click');

		assert.strictEqual(1, listener.callCount);
	});

	it('should proxy delegate event from dom element origin to target', function() {
		let origin = document.createElement('div');
		dom.append(origin, '<button class="testButton"></button>');
		document.body.appendChild(origin);

		let target = new EventEmitter();
		new DomEventEmitterProxy(origin, target);

		let listener = sinon.stub();
		target.on('delegate:click:.testButton', listener);
		let button = origin.querySelector('.testButton');
		dom.triggerEvent(button, 'click');

		assert.strictEqual(1, listener.callCount);
		assert.ok(listener.args[0][0]);
		document.body.removeChild(origin);
	});

	it('should proxy delegate event that contains ":" in selector', function() {
		let origin = document.createElement('div');
		dom.append(origin, '<button data-onclick="test:handleClick"></button>');
		document.body.appendChild(origin);

		let target = new EventEmitter();
		new DomEventEmitterProxy(origin, target);

		let listener = sinon.stub();
		target.on('delegate:click:[data-onclick="test:handleClick"]', listener);
		let button = origin.querySelector('[data-onclick="test:handleClick"]');
		dom.triggerEvent(button, 'click');

		assert.strictEqual(1, listener.callCount);
		document.body.removeChild(origin);
	});

	it('should try to proxy event with "delegate:" prefix but no selector', function() {
		let origin = document.createElement('div');
		document.body.appendChild(origin);

		let target = new EventEmitter();
		new DomEventEmitterProxy(origin, target);

		sinon.spy(dom, 'delegate');
		target.on('delegate:click', sinon.stub());
		assert.strictEqual(0, dom.delegate.callCount);

		dom.delegate.restore();
		document.body.removeChild(origin);
	});

	it('should change the element that events are proxied from', function() {
		let origin = document.createElement('div');
		document.body.appendChild(origin);

		let target = new EventEmitter();
		let proxy = new DomEventEmitterProxy(origin, target);

		let listener = sinon.stub();
		target.on('click', listener);

		let origin2 = document.createElement('div');
		document.body.appendChild(origin2);
		proxy.setOriginEmitter(origin2);

		dom.triggerEvent(origin, 'click');
		assert.strictEqual(0, listener.callCount);

		dom.triggerEvent(origin2, 'click');
		assert.strictEqual(1, listener.callCount);
		assert.ok(listener.args[0][0]);

		document.body.removeChild(origin);
	});

	it('should not proxy event emitter events after disposed', function() {
		let origin = new EventEmitter();
		let target = new EventEmitter();
		let proxy = new DomEventEmitterProxy(origin, target);

		let listener = sinon.stub();
		target.on('event1', listener);

		proxy.dispose();
		origin.emit('event1', 1, 2);
		assert.strictEqual(0, listener.callCount);
	});

	it('should not proxy dom events after disposed', function() {
		let origin = document.createElement('div');

		let target = new EventEmitter();
		let proxy = new DomEventEmitterProxy(origin, target);

		let listener = sinon.stub();
		target.on('click', listener);

		proxy.dispose();
		dom.triggerEvent(origin, 'click');
		assert.strictEqual(0, listener.callCount);
	});

	it('should not throw error if origin emitter is null', function() {
		let target = new EventEmitter();
		new DomEventEmitterProxy(null, target);

		let listener = sinon.stub();
		assert.doesNotThrow(() => target.on('click', listener));
	});
});
