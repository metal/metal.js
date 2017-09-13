'use strict';

import Component from 'metal-component';
import Soy from 'metal-soy';
import UA from 'metal-useragent';

import { defineWebComponent } from '../src/define_web_component';

describe('Web components', function() {
	before(function() {
		if (UA.matchUserAgent('MSIE')) {
			this.skip();
		}
	});

	describe('Custom elements', function() {
		let el;

		afterEach(function() {
			if (el && document.body.contains(el)) {
				document.body.removeChild(el);
			}

			document.body.innerHTML = '';
		});

		it('should not throw when creating or appending a custom element', function() {
			const tagName = createWebComponent('custom-test-element-01');

			function createEl() {
				el = document.createElement(tagName);
				return el;
			}

			function appendEl() {
				document.body.appendChild(createEl());
			}

			assert.doesNotThrow(createEl);
			assert.doesNotThrow(appendEl);
		});

		it('should have the correct tag name', function() {
			const tagName = createWebComponent('custom-test-element-02');
			el = document.createElement(tagName);
			document.body.appendChild(el);
			assert.ok(el.tagName.toLowerCase() == tagName);
		});

		it('should dispatch events when attributes change', function() {
			const tagName = createWebComponent('custom-test-element-03');

			el = document.createElement(tagName);
			document.body.appendChild(el);

			const fn = sinon.stub();

			el.addEventListener('titleChanged', fn);

			el.setAttribute('title', 'new title');
			assert.strictEqual(1, fn.callCount);

			el.setAttribute('non-existing', 'test');
			assert.strictEqual(1, fn.callCount);
		});

		it('should have the correct inner html', function() {
			const tagName = createWebComponent('custom-test-element-04');
			el = document.createElement(tagName);

			document.body.appendChild(el);

			assert.equal(el.innerHTML, '<div title="default title"></div>');
		});

		it('should have the correct inner html when useshadowdom is true', function() {
			const tagName = createWebComponent('custom-test-element-05');
			el = document.createElement(tagName);
			el.setAttribute('useshadowdom', true);

			document.body.appendChild(el);

			assert.equal(el.shadowRoot.innerHTML, '<div title="default title"></div>');
		});

		it('should render custom element via html', function() {
			const tagName = createWebComponent('custom-test-element-06');

			const innerHTML = '<' + tagName + '></' + tagName + '>';

			document.body.innerHTML = innerHTML;

			assert.equal(document.body.innerHTML, '<metal-test-component-custom-test-element-06><div title="default title"></div></metal-test-component-custom-test-element-06>');
		});

		it('should render custom element via html when useshadowdom is true', function() {
			const tagName = createWebComponent('custom-test-element-07');

			const innerHTML = '<' + tagName + ' useshadowdom="true"></' + tagName + '>';

			document.body.innerHTML = innerHTML;

			el = document.querySelector(tagName);

			assert.equal(el.shadowRoot.innerHTML, '<div title="default title"></div>');
		});
	});

	function createWebComponent(name) {
		const tagName = `metal-test-component-${name}`;

		class WebComponent extends Component {}

		WebComponent.STATE = {
			title: {
				value: 'default title'
			}
		};

		Soy.register(WebComponent, {
			render: () => {
				IncrementalDOM.elementVoid('div', null, [
					'title', WebComponent.STATE.title.value
				]);
			}
		});

		defineWebComponent(tagName, WebComponent);

		return tagName;
	}
});
