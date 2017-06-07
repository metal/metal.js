'use strict';

import Component from 'metal-component';
import Soy from 'metal-soy';
import { defineWebComponent } from '../src/customElement';

describe('customElement', function() {

	describe('webcomponents', function() {
		let el;

		afterEach(function() {
			if (el) {
				document.body.removeChild(el);
			}
		});

		it('should not throw when creating a custom element', function() {
			const tagName = createWebComponent();

			const createEl = () => {
				el = document.createElement(tagName);
				return el;
			};
			const appendEl = () => document.body.appendChild(createEl());

			assert.doesNotThrow(createEl);
			assert.doesNotThrow(appendEl);
		});

		it('should dispatch events when attributes change', function() {

			const tagName = createWebComponent();

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

	function createWebComponent() {
		const tagName = `metal-test-component-${Date.now()}`;

		class WebComponent extends Component {
		}

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
