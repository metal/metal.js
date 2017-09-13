'use strict';

import Component from 'metal-component';
import Soy from 'metal-soy';
import { defineWebComponent } from '../src/define_web_component';


describe('Web components', function() {

	describe('Custom elements', function() {
		let el;

		afterEach(function() {
			if (el && document.body.contains(el)) {
				document.body.removeChild(el);
			}
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
