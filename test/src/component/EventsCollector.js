'use strict';

import dom from '../../../src/dom/dom';
import Component from '../../../src/component/Component';
import ComponentCollector from '../../../src/component/ComponentCollector';
import EventsCollector from '../../../src/component/EventsCollector';

describe('EventsCollector', function() {
	it('should fail when component instance is not passed', function() {
		assert.throws(function() {
			new EventsCollector();
		});
	});

	it('should not throw error if content is not a string', function() {
		var custom = createCustomComponentInstance('<div></div><div></div>');
		var collector = new EventsCollector(custom);

		assert.doesNotThrow(function() {
			collector.attachListeners(custom.element, 'group');
		});
	});

	it('should not throw error if no listeners are found', function() {
		var custom = createCustomComponentInstance('<div></div><div></div>');
		var collector = new EventsCollector(custom);

		assert.doesNotThrow(function() {
			collector.attachListeners(custom.element.innerHTML, 'group');
		});
	});

	it('should attach event listener', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick="handleClick"></div><div></div>'
		);
		custom.handleClick = sinon.stub();

		var collector = new EventsCollector(custom);
		collector.attachListeners(custom.element.innerHTML, 'group');

		assert.strictEqual(0, custom.handleClick.callCount);
		dom.triggerEvent(custom.element.childNodes[0], 'click');
		assert.strictEqual(1, custom.handleClick.callCount);
		dom.triggerEvent(custom.element.childNodes[1], 'click');
		assert.strictEqual(1, custom.handleClick.callCount);
	});

	it('should attach event listener with single quotes', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick=\'handleClick\'></div><div></div>'
		);
		custom.handleClick = sinon.stub();

		var collector = new EventsCollector(custom);
		collector.attachListeners(custom.element.innerHTML, 'group');

		assert.strictEqual(0, custom.handleClick.callCount);
		dom.triggerEvent(custom.element.childNodes[0], 'click');
		assert.strictEqual(1, custom.handleClick.callCount);
		dom.triggerEvent(custom.element.childNodes[1], 'click');
		assert.strictEqual(1, custom.handleClick.callCount);
	});

	it('should attach event listener with a function from another component', function() {
		var another = createCustomComponentInstance('');
		another.handleClick = sinon.stub();
		ComponentCollector.components['another-comp'] = another;

		var custom = createCustomComponentInstance(
			'<div data-onclick="another-comp:handleClick"></div><div></div>'
		);
		custom.handleClick = sinon.stub();

		var collector = new EventsCollector(custom);
		collector.attachListeners(custom.element.innerHTML, 'group');

		assert.strictEqual(0, custom.handleClick.callCount);
		dom.triggerEvent(custom.element.childNodes[0], 'click');
		assert.strictEqual(0, custom.handleClick.callCount);
		assert.strictEqual(1, another.handleClick.callCount);
	});

	it('should print error if trying to attach function from non existing component', function() {
		var nonExisting = createCustomComponentInstance('');
		nonExisting.handleClick = sinon.stub();
		var custom = createCustomComponentInstance(
			'<div data-onclick="non-existing:handleClick"></div><div></div>'
		);
		custom.handleClick = sinon.stub();

		var collector = new EventsCollector(custom);

		sinon.stub(console, 'error');
		collector.attachListeners(custom.element.innerHTML, 'group');
		assert.strictEqual(1, console.error.callCount);

		dom.triggerEvent(custom.element.childNodes[0], 'click');
		assert.strictEqual(1, custom.handleClick.callCount);
		assert.strictEqual(0, nonExisting.handleClick.callCount);

		console.error.restore();
	});

	it('should print error if trying to attach unexisting function', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick="handleClick"></div><div></div>'
		);
		var collector = new EventsCollector(custom);

		sinon.stub(console, 'error');
		collector.attachListeners(custom.element.innerHTML);
		assert.strictEqual(1, console.error.callCount);

		console.error.restore();
	});

	it('should attach multiple event listeners', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick="handleClick" data-onkeydown="handleKeyDown"></div>'
		);
		custom.handleClick = sinon.stub();
		custom.handleKeyDown = sinon.stub();

		var collector = new EventsCollector(custom);
		collector.attachListeners(custom.element.innerHTML, 'group');

		dom.triggerEvent(custom.element.childNodes[0], 'click');
		assert.strictEqual(1, custom.handleClick.callCount);

		dom.triggerEvent(custom.element.childNodes[0], 'keydown');
		assert.strictEqual(1, custom.handleKeyDown.callCount);
	});

	it('should attach multiple listeners for the same element and event type', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick="handleClick,handleAnotherClick"></div><div></div>'
		);
		custom.handleClick = sinon.stub();
		custom.handleAnotherClick = sinon.stub();

		var collector = new EventsCollector(custom);
		collector.attachListeners(custom.element.innerHTML, 'group');

		assert.strictEqual(0, custom.handleClick.callCount);
		assert.strictEqual(0, custom.handleAnotherClick.callCount);
		dom.triggerEvent(custom.element.childNodes[0], 'click');
		assert.strictEqual(1, custom.handleClick.callCount);
		assert.strictEqual(1, custom.handleAnotherClick.callCount);
		dom.triggerEvent(custom.element.childNodes[1], 'click');
		assert.strictEqual(1, custom.handleClick.callCount);
		assert.strictEqual(1, custom.handleAnotherClick.callCount);
	});

	it('should trigger attached listener registered by multiple elements only once', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick="handleClick"></div><div data-onclick="handleClick"></div>'
		);
		custom.handleClick = sinon.stub();

		var collector = new EventsCollector(custom);
		collector.attachListeners(custom.element.innerHTML, 'group');

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
		collector.attachListeners(custom.element.innerHTML, 'group');
		var childCollector = new EventsCollector(child);
		childCollector.attachListeners(child.element.innerHTML, 'group');

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
		collector.attachListeners(custom.element.innerHTML, 'group');
		var childCollector = new EventsCollector(child);
		childCollector.attachListeners(child.element.innerHTML, 'group');

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
		collector.attachListeners(custom.element.innerHTML, 'group');

		var trigger = custom.element.childNodes[0];
		trigger.removeAttribute('data-onclick');
		custom.element.removeEventListener = sinon.stub();

		collector.attachListeners(custom.element.innerHTML, 'group');
		collector.detachUnusedListeners();

		assert.strictEqual(1, custom.element.removeEventListener.callCount);
		assert.strictEqual('click', custom.element.removeEventListener.args[0][0]);
	});

	it('should not throw error when detaching unused listeners twice', function() {
		var custom = createCustomComponentInstance(
			'<div data-onclick="handleClick" data-onkeydown="handleKeyDown"></div>'
		);
		custom.handleClick = sinon.stub();
		custom.handleKeyDown = sinon.stub();

		var collector = new EventsCollector(custom);
		collector.attachListeners(custom.element.innerHTML, 'group');

		var trigger = custom.element.childNodes[0];
		trigger.removeAttribute('data-onclick');

		collector.attachListeners(custom.element.innerHTML, 'group');
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
		collector.attachListeners(custom.element.innerHTML, 'group');

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
		collector.attachListeners(custom.element.innerHTML, 'group');

		var trigger = custom.element.childNodes[0];
		trigger.removeAttribute('data-onclick');

		collector.attachListeners(custom.element.innerHTML, 'group');
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
		collector.attachListeners(custom.element.innerHTML, 'group');

		collector.dispose();
		dom.triggerEvent(custom.element.childNodes[0], 'click');
		assert.strictEqual(0, custom.handleClick.callCount);
		dom.triggerEvent(custom.element.childNodes[0], 'keydown');
		assert.strictEqual(0, custom.handleKeyDown.callCount);
	});

	it('should check if listeners have been attached for the given group before', function() {
		var custom = createCustomComponentInstance('<div data-onclick="handleClick"></div>');
		custom.handleClick = sinon.stub();

		var collector = new EventsCollector(custom);
		assert.ok(!collector.hasAttachedForGroup('group'));

		collector.attachListeners(custom.element.innerHTML, 'group');
		assert.ok(collector.hasAttachedForGroup('group'));
	});

	function createCustomComponentInstance(content) {
		class CustomComponent extends Component {
			constructor(opt_config) {
				super(opt_config);
			}
		}
		var comp = new CustomComponent().render();
		dom.append(comp.element, content);
		return comp;
	}
});
