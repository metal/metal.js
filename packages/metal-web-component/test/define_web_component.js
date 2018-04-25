'use strict';

import Component from 'metal-component';
import core from 'metal';
import Soy from 'metal-soy';
import UA from 'metal-useragent';
import {JSXComponent} from 'metal-jsx';

import {defineWebComponent} from '../src/define_web_component';

describe('Web components', function() {
	let el;

	before(function() {
		if (UA.matchUserAgent('MSIE') || isSafariVersion('8.0')) {
			this.skip();
		}
	});

	afterEach(function() {
		if (el && document.body.contains(el)) {
			document.body.removeChild(el);
		}

		document.body.innerHTML = '';
	});

	describe('Define Soy component', function() {
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

			assert.equal(
				el.shadowRoot.innerHTML,
				'<div title="default title"></div>'
			);
		});

		it('should render custom element via html', function() {
			const tagName = createWebComponent('custom-test-element-06');

			const innerHTML = '<' + tagName + '></' + tagName + '>';

			document.body.innerHTML = innerHTML;

			assert.equal(
				document.body.innerHTML,
				'<metal-test-component-custom-test-element-06><div title="default title"></div></metal-test-component-custom-test-element-06>'
			);
		});

		it('should render custom element via html when useshadowdom is true', function() {
			const tagName = createWebComponent('custom-test-element-07');

			const innerHTML =
				'<' + tagName + ' useshadowdom="true"></' + tagName + '>';

			document.body.innerHTML = innerHTML;

			el = document.querySelector(tagName);

			assert.equal(
				el.shadowRoot.innerHTML,
				'<div title="default title"></div>'
			);
		});

		it('should deserialize attribute if json is passed', function() {
			const tagName = createWebComponent('custom-test-element-08');
			el = document.createElement(tagName);

			el.setAttribute('title', '{"key1": "value1", "key2": "value2"}');
			document.body.appendChild(el);

			let title = el.component.title;

			assert.isObject(title);
			assert.equal(title.key1, 'value1');
			assert.equal(title.key2, 'value2');

			el.setAttribute('title', '{"key3": "value3"}');

			title = el.component.title;

			assert.isObject(title);
			assert.isUndefined(title.key1);
			assert.equal(title.key3, 'value3');
		});

		it('should deserialize the attribute if a number is passed', function() {
			const validator = val => {
				return core.isNumber(val);
			};

			const tagName = createWebComponent('custom-test-element-10', validator);
			el = document.createElement(tagName);

			el.setAttribute('title', 10);
			document.body.appendChild(el);

			let title = el.component.title;

			assert.isNumber(title);
			assert.equal(title, 10);

			el.setAttribute('title', 100);

			title = el.component.title;

			assert.isNumber(title);
			assert.equal(title, 100);
		});

		it('should deserialize the attribute if a number is passed as a string', function() {
			const validator = val => {
				return core.isString(val);
			};

			const tagName = createWebComponent('custom-test-element-11', validator);
			el = document.createElement(tagName);

			el.setAttribute('title', '"10"');
			document.body.appendChild(el);

			let title = el.component.title;

			assert.isString(title);
			assert.equal(title, '10');

			el.setAttribute('title', '"100"');

			title = el.component.title;

			assert.isString(title);
			assert.equal(title, '100');
		});

		it('should deserialize the attribute if a boolean is passed', function() {
			const validator = val => {
				return core.isBoolean(val);
			};

			const tagName = createWebComponent('custom-test-element-12', validator);
			el = document.createElement(tagName);

			el.setAttribute('title', true);
			document.body.appendChild(el);

			let title = el.component.title;

			assert.isBoolean(title);
			assert.equal(title, true);

			el.setAttribute('title', false);

			title = el.component.title;

			assert.isBoolean(title);
			assert.equal(title, false);
		});

		it('should have the default state value after rendering', function() {
			const tagName = createWebComponent('custom-test-element-09');
			el = document.createElement(tagName);

			document.body.appendChild(el);

			assert.equal(el.component.title, 'default title');
		});
	});

	describe('Define JSX component', function() {
		it('should not throw when creating or appending a custom element', function() {
			const tagName = createJSXWebComponent('custom-jsx-test-element-01');

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
			const tagName = createJSXWebComponent('custom-jsx-test-element-02');
			el = document.createElement(tagName);
			document.body.appendChild(el);
			assert.ok(el.tagName.toLowerCase() == tagName);
		});

		it('should dispatch events when attributes change', function() {
			const tagName = createJSXWebComponent('custom-jsx-test-element-03');

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
			const tagName = createJSXWebComponent('custom-jsx-test-element-04');
			el = document.createElement(tagName);

			document.body.appendChild(el);

			assert.equal(el.innerHTML, '<div title="default title"></div>');
		});

		it('should have the correct inner html when useshadowdom is true', function() {
			const tagName = createJSXWebComponent('custom-jsx-test-element-05');
			el = document.createElement(tagName);
			el.setAttribute('useshadowdom', true);

			document.body.appendChild(el);

			assert.equal(
				el.shadowRoot.innerHTML,
				'<div title="default title"></div>'
			);
		});

		it('should render custom element via html', function() {
			const tagName = createJSXWebComponent('custom-jsx-test-element-06');

			const innerHTML = '<' + tagName + '></' + tagName + '>';

			document.body.innerHTML = innerHTML;

			assert.equal(
				document.body.innerHTML,
				'<metal-test-component-custom-jsx-test-element-06><div title="default title"></div></metal-test-component-custom-jsx-test-element-06>'
			);
		});

		it('should render custom element via html when useshadowdom is true', function() {
			const tagName = createJSXWebComponent('custom-jsx-test-element-07');

			const innerHTML =
				'<' + tagName + ' useshadowdom="true"></' + tagName + '>';

			document.body.innerHTML = innerHTML;

			el = document.querySelector(tagName);

			assert.equal(
				el.shadowRoot.innerHTML,
				'<div title="default title"></div>'
			);
		});

		it('should deserialize attribute if json is passed', function() {
			const tagName = createJSXWebComponent('custom-jsx-test-element-08');
			el = document.createElement(tagName);

			el.setAttribute('title', '{"key1": "value1", "key2": "value2"}');
			document.body.appendChild(el);

			let title = el.component.props.title;

			assert.isObject(title);
			assert.equal(title.key1, 'value1');
			assert.equal(title.key2, 'value2');

			el.setAttribute('title', '{"key3": "value3"}');

			title = el.component.props.title;

			assert.isObject(title);
			assert.isUndefined(title.key1);
			assert.equal(title.key3, 'value3');
		});

		it('should deserialize the attribute if a number is passed', function() {
			const validator = val => {
				return core.isNumber(val);
			};

			const tagName = createJSXWebComponent(
				'custom-jsx-test-element-09',
				validator
			);
			el = document.createElement(tagName);

			el.setAttribute('title', 10);
			document.body.appendChild(el);

			let title = el.component.props.title;

			assert.isNumber(title);
			assert.equal(title, 10);

			el.setAttribute('title', 100);

			title = el.component.props.title;

			assert.isNumber(title);
			assert.equal(title, 100);
		});

		it('should deserialize the attribute if a number is passed as a string', function() {
			const validator = val => {
				return core.isString(val);
			};

			const tagName = createJSXWebComponent(
				'custom-jsx-test-element-10',
				validator
			);
			el = document.createElement(tagName);

			el.setAttribute('title', '"10"');
			document.body.appendChild(el);

			let title = el.component.props.title;

			assert.isString(title);
			assert.equal(title, '10');

			el.setAttribute('title', '"100"');

			title = el.component.props.title;

			assert.isString(title);
			assert.equal(title, '100');
		});

		it('should deserialize the attribute if a boolean is passed', function() {
			const validator = val => {
				return core.isBoolean(val);
			};

			const tagName = createJSXWebComponent(
				'custom-jsx-test-element-11',
				validator
			);
			el = document.createElement(tagName);

			el.setAttribute('title', true);
			document.body.appendChild(el);

			let title = el.component.props.title;

			assert.isBoolean(title);
			assert.equal(title, true);

			el.setAttribute('title', false);

			title = el.component.props.title;

			assert.isBoolean(title);
			assert.equal(title, false);
		});
	});

	function createJSXWebComponent(name, validator = val => true) {
		const tagName = `metal-test-component-${name}`;

		class WebComponent extends JSXComponent {
			render() {
				IncrementalDOM.elementVoid('div', null, [
					'title',
					WebComponent.PROPS.title.value,
				]);
			}
		}

		WebComponent.PROPS = {
			title: {
				value: 'default title',
				validator: validator,
			},
		};

		defineWebComponent(tagName, WebComponent);

		return tagName;
	}

	function createWebComponent(name, validator = val => true) {
		const tagName = `metal-test-component-${name}`;

		class WebComponent extends Component {}

		WebComponent.STATE = {
			title: {
				value: 'default title',
				validator: validator,
			},
		};

		Soy.register(WebComponent, {
			render: () => {
				IncrementalDOM.elementVoid('div', null, [
					'title',
					WebComponent.STATE.title.value,
				]);
			},
		});

		defineWebComponent(tagName, WebComponent);

		return tagName;
	}

	function isSafariVersion(version) {
		if (!UA.isSafari) return false;
		const nav = (window && window.navigator) || {};
		return !!new RegExp('Version/' + version).exec(nav.userAgent);
	}
});
