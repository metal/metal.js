'use strict';

import dom from '../src/dom';
import features from '../src/features';

describe('features', function() {
	before(function() {
		sinon.spy(dom, 'append');
		features.animationEventName_ = undefined;
		features.attrOrderChange_ = undefined;
		features.transitionEndEventName_ = undefined;
	});

	after(function() {
		dom.append.restore();
	});

	describe('Method checkAttrOrderChange', function() {
		it('should check if current browser changes attribute order', function() {
			var result = features.checkAttrOrderChange();
			assert.strictEqual(1, dom.append.callCount);

			var element = dom.append.args[0][0];
			var original = dom.append.args[0][1];
			assert.strictEqual(result, original !== element.innerHTML);
		});

		it('should not recalculate result when called multiple times', function() {
			features.checkAttrOrderChange();
			features.checkAttrOrderChange();
			assert.strictEqual(1, dom.append.callCount);
		});
	});

	describe('Method checkAnimationEventName', function() {
		beforeEach(function() {
			features.animationEventName_ = undefined;
			this.animationElement = features.animationElement_;
		});

		afterEach(function() {
			features.animationEventName_ = undefined;
			features.animationElement_ = this.animationElement;
		});

		it('should output default event name', function() {
			features.animationElement_ = {
				style: {}
			};
			assert.strictEqual('animationend', features.checkAnimationEventName().animation);
			assert.strictEqual('transitionend', features.checkAnimationEventName().transition);
		});

		it('should check for native browser support', function() {
			mockAnimationElementStyles('');
			assert.strictEqual('animationend', features.checkAnimationEventName().animation);
			assert.strictEqual('transitionend', features.checkAnimationEventName().transition);
		});

		it('should check for Webkit browsers', function() {
			mockAnimationElementStyles('Webkit');
			assert.strictEqual('webkitAnimationEnd', features.checkAnimationEventName().animation);
			assert.strictEqual('webkitTransitionEnd', features.checkAnimationEventName().transition);
		});

		it('should check for MS browsers', function() {
			mockAnimationElementStyles('MS');
			assert.strictEqual('msAnimationEnd', features.checkAnimationEventName().animation);
			assert.strictEqual('msTransitionEnd', features.checkAnimationEventName().transition);
		});

		it('should check for Opera browsers', function() {
			mockAnimationElementStyles('O');
			assert.strictEqual('oAnimationEnd', features.checkAnimationEventName().animation);
			assert.strictEqual('oTransitionEnd', features.checkAnimationEventName().transition);
		});

		function mockAnimationElementStyles(browserPrefix) {
			features.animationElement_ = {
				style: {}
			};
			features.animationElement_.style[browserPrefix + 'animation'] = true;
			features.animationElement_.style[browserPrefix + 'transition'] = true;
			features.animationElement_.style[browserPrefix + 'Animation'] = true;
			features.animationElement_.style[browserPrefix + 'Transition'] = true;
		}
	});
});
