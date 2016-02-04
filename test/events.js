'use strict';

import dom from '../src/dom';
import features from '../src/features';
import '../src/events';

describe('Custom Events', function() {
	beforeEach(function() {
		var element1 = document.createElement('div');
		dom.append(document.body, element1);
		var element2 = document.createElement('div');
		dom.addClasses(element2, 'inner');
		dom.append(element1, element2);
		var element3 = document.createElement('div');
		dom.append(element2, element3);

		this.element1 = element1;
		this.element2 = element2;
		this.element3 = element3;
	});

	it('should delegate mouseenter event', function() {
		var listener = sinon.stub();
		dom.delegate(this.element1, 'mouseenter', '.inner', listener);

		dom.triggerEvent(this.element1, 'mouseover');
		assert.strictEqual(0, listener.callCount);
		dom.triggerEvent(this.element2, 'mouseover', {
			relatedTarget: this.element1
		});
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual('mouseenter', listener.args[0][0].customType);
		dom.triggerEvent(this.element2, 'mouseover', {
			relatedTarget: this.element3
		});
		assert.strictEqual(1, listener.callCount);
	});

	it('should delegate mouseleave event', function() {
		var listener = sinon.stub();
		dom.delegate(this.element1, 'mouseleave', '.inner', listener);

		dom.triggerEvent(this.element1, 'mouseout');
		assert.strictEqual(0, listener.callCount);
		dom.triggerEvent(this.element2, 'mouseout', {
			relatedTarget: this.element1
		});
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual('mouseleave', listener.args[0][0].customType);
		dom.triggerEvent(this.element2, 'mouseout', {
			relatedTarget: this.element3
		});
		assert.strictEqual(1, listener.callCount);
	});

	it('should delegate pointerenter event', function() {
		var listener = sinon.stub();
		dom.delegate(this.element1, 'pointerenter', '.inner', listener);

		dom.triggerEvent(this.element1, 'pointerover');
		assert.strictEqual(0, listener.callCount);
		dom.triggerEvent(this.element2, 'pointerover', {
			relatedTarget: this.element1
		});
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual('pointerenter', listener.args[0][0].customType);
		dom.triggerEvent(this.element2, 'pointerover', {
			relatedTarget: this.element3
		});
		assert.strictEqual(1, listener.callCount);
	});

	it('should delegate pointerleave event', function() {
		var listener = sinon.stub();
		dom.delegate(this.element1, 'pointerleave', '.inner', listener);

		dom.triggerEvent(this.element1, 'pointerout');
		assert.strictEqual(0, listener.callCount);
		dom.triggerEvent(this.element2, 'pointerout', {
			relatedTarget: this.element1
		});
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual('pointerleave', listener.args[0][0].customType);
		dom.triggerEvent(this.element2, 'pointerout', {
			relatedTarget: this.element3
		});
		assert.strictEqual(1, listener.callCount);
	});

	it('should handle transitionend event', function() {
		var listener = sinon.stub();
		dom.on(this.element1, 'transitionend', listener);
		dom.triggerEvent(this.element1, features.checkAnimationEventName().transition);
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual('transitionend', listener.args[0][0].customType);
	});

	it('should handle animationend event', function() {
		var listener = sinon.stub();
		dom.on(this.element1, 'animationend', listener);
		dom.triggerEvent(this.element1, features.checkAnimationEventName().animation);
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual('animationend', listener.args[0][0].customType);
	});
});
