'use strict';

import dom from 'metal-dom';
import Component from '../src/Component';
import EventsCollector from '../src/EventsCollector';

describe('EventsCollector', function() {
	it('should fail when component instance is not passed', function() {
		assert.throws(function() {
			new EventsCollector();
		});
	});

	it('should attach event listeners', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick="handleClick" data-onkeydown="handleKeyDown"></div>'
		);
		custom.handleClick = sinon.stub();
		custom.handleKeyDown = sinon.stub();

		var collector = new EventsCollector(custom);
		collector.startCollecting();
		collector.attachListener('click', 'handleClick');
		collector.attachListener('keydown', 'handleKeyDown');

		assert.strictEqual(0, custom.handleClick.callCount);
		assert.strictEqual(0, custom.handleKeyDown.callCount);

		dom.triggerEvent(custom.element.childNodes[0], 'click');
		assert.strictEqual(1, custom.handleClick.callCount);
		assert.strictEqual(0, custom.handleKeyDown.callCount);

		dom.triggerEvent(custom.element.childNodes[0], 'keydown');
		assert.strictEqual(1, custom.handleClick.callCount);
		assert.strictEqual(1, custom.handleKeyDown.callCount);
	});

	it('should print error if trying to attach unexisting function', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick="handleClick"></div><div></div>'
		);
		var collector = new EventsCollector(custom);

		sinon.stub(console, 'error');
		collector.startCollecting();
		collector.attachListener('click', 'handleClick');
		assert.strictEqual(1, console.error.callCount);

		console.error.restore();
	});

	it('should attach multiple listeners for the same element and event type', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick="handleClick,handleAnotherClick"></div><div></div>'
		);
		custom.handleClick = sinon.stub();
		custom.handleAnotherClick = sinon.stub();

		var collector = new EventsCollector(custom);
		collector.startCollecting();
		collector.attachListener('click', 'handleClick,handleAnotherClick');

		assert.strictEqual(0, custom.handleClick.callCount);
		assert.strictEqual(0, custom.handleAnotherClick.callCount);
		dom.triggerEvent(custom.element.childNodes[0], 'click');
		assert.strictEqual(1, custom.handleClick.callCount);
		assert.strictEqual(1, custom.handleAnotherClick.callCount);
		dom.triggerEvent(custom.element.childNodes[1], 'click');
		assert.strictEqual(1, custom.handleClick.callCount);
		assert.strictEqual(1, custom.handleAnotherClick.callCount);
	});

	it('should trigger attached listener registered multiple times only once', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick="handleClick"></div><div data-onclick="handleClick"></div>'
		);
		custom.handleClick = sinon.stub();

		var collector = new EventsCollector(custom);
		collector.startCollecting();
		collector.attachListener('click', 'handleClick');
		collector.attachListener('click', 'handleClick');

		dom.triggerEvent(custom.element.childNodes[0], 'click');
		assert.strictEqual(1, custom.handleClick.callCount);
		dom.triggerEvent(custom.element.childNodes[1], 'click');
		assert.strictEqual(2, custom.handleClick.callCount);
	});

	it('should not trigger sub component listeners on unrelated parent elements', function() {
		var custom = createCustomComponentInstance('<div data-onclick="handleClick"></div>');
		custom.handleClick = sinon.stub();

		var child = createCustomComponentInstance('<div data-onclick="handleClick"></div>');
		child.handleClick = sinon.stub();
		dom.append(custom.element, child.element);

		var collector = new EventsCollector(custom);
		collector.startCollecting();
		collector.attachListener('click', 'handleClick');
		var childCollector = new EventsCollector(child);
		childCollector.startCollecting();
		childCollector.attachListener('click', 'handleClick');

		dom.triggerEvent(child.element.childNodes[0], 'click');
		assert.strictEqual(0, custom.handleClick.callCount);
		assert.strictEqual(1, child.handleClick.callCount);

		dom.triggerEvent(custom.element.childNodes[0], 'click');
		assert.strictEqual(1, custom.handleClick.callCount);
		assert.strictEqual(1, child.handleClick.callCount);
	});

	it('should trigger listeners that bubbled from sub components to correct element', function() {
		var custom = createCustomComponentInstance('<div data-onclick="handleClick"></div>');
		custom.handleClick = sinon.stub();

		var child = createCustomComponentInstance('<div data-onclick="handleClick"></div>');
		child.handleClick = sinon.stub();
		dom.append(custom.element.childNodes[0], child.element);

		var collector = new EventsCollector(custom);
		collector.startCollecting();
		collector.attachListener('click', 'handleClick');
		var childCollector = new EventsCollector(child);
		childCollector.startCollecting();
		childCollector.attachListener('click', 'handleClick');

		dom.triggerEvent(child.element.childNodes[0], 'click');
		assert.strictEqual(1, custom.handleClick.callCount);
		assert.strictEqual(1, child.handleClick.callCount);
	});

	it('should detach listeners that are unused', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick="handleClick" data-onkeydown="handleKeyDown"></div>'
		);
		custom.handleClick = sinon.stub();
		custom.handleKeyDown = sinon.stub();

		var collector = new EventsCollector(custom);
		collector.startCollecting();
		collector.attachListener('click', 'handleClick');
		collector.attachListener('keydown', 'handleKeyDown');

		collector.startCollecting();
		collector.attachListener('click', 'handleClick');
		collector.detachUnusedListeners();

		dom.triggerEvent(custom.element.childNodes[0], 'click');
		assert.strictEqual(1, custom.handleClick.callCount);

		dom.triggerEvent(custom.element.childNodes[0], 'keydown');
		assert.strictEqual(0, custom.handleKeyDown.callCount);
	});

	it('should not throw error when detaching unused listeners twice', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick="handleClick" data-onkeydown="handleKeyDown"></div>'
		);
		custom.handleClick = sinon.stub();
		custom.handleKeyDown = sinon.stub();

		var collector = new EventsCollector(custom);
		collector.startCollecting();
		collector.attachListener('click', 'handleClick');
		collector.attachListener('keydown', 'handleKeyDown');

		collector.startCollecting();
		collector.attachListener('click', 'handleClick');
		collector.detachUnusedListeners();

		assert.doesNotThrow(function() {
			collector.detachUnusedListeners();
		});
	});

	it('should detach all listeners when detachAllListeners is called', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick="handleClick" data-onkeydown="handleKeyDown"></div>'
		);
		custom.handleClick = sinon.stub();
		custom.handleKeyDown = sinon.stub();

		var collector = new EventsCollector(custom);
		collector.startCollecting();
		collector.attachListener('click', 'handleClick');
		collector.attachListener('keydown', 'handleKeyDown');

		collector.detachAllListeners();
		dom.triggerEvent(custom.element.childNodes[0], 'click');
		assert.strictEqual(0, custom.handleClick.callCount);
		dom.triggerEvent(custom.element.childNodes[0], 'keydown');
		assert.strictEqual(0, custom.handleKeyDown.callCount);
	});

	it('should detach remaining listeners when detachAllListeners is called', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick="handleClick" data-onkeydown="handleKeyDown"></div>'
		);
		custom.handleClick = sinon.stub();
		custom.handleKeyDown = sinon.stub();

		var collector = new EventsCollector(custom);
		collector.startCollecting();
		collector.attachListener('click', 'handleClick');
		collector.attachListener('keydown', 'handleKeyDown');

		collector.startCollecting();
		collector.attachListener('click', 'handleClick');
		collector.detachUnusedListeners();

		collector.detachAllListeners();
		dom.triggerEvent(custom.element.childNodes[0], 'keydown');
		assert.strictEqual(0, custom.handleKeyDown.callCount);
	});

	it('should detach all listeners when collector is disposed', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick="handleClick" data-onkeydown="handleKeyDown"></div>'
		);
		custom.handleClick = sinon.stub();
		custom.handleKeyDown = sinon.stub();

		var collector = new EventsCollector(custom);
		collector.startCollecting();
		collector.attachListener('click', 'handleClick');
		collector.attachListener('keydown', 'handleKeyDown');

		collector.dispose();
		dom.triggerEvent(custom.element.childNodes[0], 'click');
		assert.strictEqual(0, custom.handleClick.callCount);
		dom.triggerEvent(custom.element.childNodes[0], 'keydown');
		assert.strictEqual(0, custom.handleKeyDown.callCount);
	});

	function createCustomComponentInstance(content) {
		class CustomComponent extends Component {
		}
		var comp = new CustomComponent();
		dom.append(comp.element, content);
		return comp;
	}
});
