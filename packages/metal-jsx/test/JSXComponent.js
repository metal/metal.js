'use strict';

import dom from 'metal-dom';
import JSXComponent from '../src/JSXComponent';

describe('JSXComponent', function() {
	var component;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
	});

	it('should render contents from component\'s "render" function', function() {
		class TestComponent extends JSXComponent {
			render() {
				return <div class="test">Hello World</div>;
			}
		}

		component = new TestComponent();
		assert.strictEqual('DIV', component.element.tagName);
		assert.ok(dom.hasClass(component.element, 'test'));
		assert.strictEqual('Hello World', component.element.textContent);
	});

	it('should render returned contents from variable in "render" function', function() {
		class TestComponent extends JSXComponent {
			render() {
				var jsx = <div class="test">Hello World</div>;
				return jsx;
			}
		}

		component = new TestComponent();
		assert.strictEqual('DIV', component.element.tagName);
		assert.ok(dom.hasClass(component.element, 'test'));
		assert.strictEqual('Hello World', component.element.textContent);
	});

	it('should not throw error if no jsx function is implemented', function() {
		class TestComponent extends JSXComponent {
		}

		component = new TestComponent();
		assert.strictEqual('DIV', component.element.tagName);
		assert.strictEqual('', component.element.textContent);
	});

	it('should attach inline listeners', function() {
		class TestComponent extends JSXComponent {
			render() {
				return <div>
					<button onClick={this.handleClick.bind(this)}></button>
				</div>;
			}
		}
		TestComponent.prototype.handleClick = sinon.stub();

		component = new TestComponent();
		dom.triggerEvent(component.element.childNodes[0], 'click');
		assert.strictEqual(1, component.handleClick.callCount);
	});

	it('should create and render sub components', function() {
		class ChildComponent extends JSXComponent {
			render() {
				return <div class="child">Child</div>;
			}
		}

		class TestComponent extends JSXComponent {
			render() {
				return <div class="test">
					<ChildComponent ref="child"></ChildComponent>
				</div>;
			}
		}

		component = new TestComponent();
		var child = component.components.child;
		assert.ok(child);
		assert.strictEqual('DIV', child.element.tagName);
		assert.ok(dom.hasClass(child.element, 'child'));
		assert.strictEqual('Child', child.element.textContent);
		assert.strictEqual(child.element, component.element.childNodes[0]);
	});

	it('should receive data from parent components through "config" property', function() {
		class ChildComponent extends JSXComponent {
			render() {
				return <div class="child">{this.config.foo}</div>;
			}
		}

		class TestComponent extends JSXComponent {
			render() {
				return <div class="test">
					<ChildComponent ref="child" foo="Foo"></ChildComponent>
				</div>;
			}
		}

		component = new TestComponent();
		var child = component.components.child;
		assert.strictEqual('Foo', child.element.textContent);
	});

	describe('Children', function() {
		it('should be able to render children through the state property', function() {
			class ChildComponent extends JSXComponent {
				render() {
					return <div>{this.children}</div>;
				}
			}

			class TestComponent extends JSXComponent {
				render() {
					return <ChildComponent ref="child">Hello World</ChildComponent>;
				}
			}

			component = new TestComponent();
			assert.ok(component.components.child);
			assert.strictEqual(component.components.child.element, component.element);
			assert.strictEqual('DIV', component.element.tagName);
			assert.strictEqual('Hello World', component.element.textContent);
		});

		it('should not throw error if trying to render empty children', function() {
			class TestComponent extends JSXComponent {
				render() {
					return <div>{this.children}</div>;
				}
			}

			component = new TestComponent();
			assert.strictEqual(0, component.element.childNodes.length);
			assert.ok(component.children);
			assert.strictEqual(0, component.children.length);
		});

		it('should be able to render only some of the received children', function() {
			class ChildComponent extends JSXComponent {
				render() {
					return <div class="child">
						{this.children[1]}
					</div>;
				}
			}

			class TestComponent extends JSXComponent {
				render() {
					return (
						<div class="test">
							<ChildComponent ref="child">
								<span>Children Test</span>
								<span>Children Test 2</span>
								<span>Children Test 3</span>
							</ChildComponent>
						</div>
					);
				}
			}

			component = new TestComponent();
			var child = component.components.child;
			assert.strictEqual(1, child.element.childNodes.length);
			assert.strictEqual('SPAN', child.element.childNodes[0].tagName);
			assert.strictEqual('Children Test 2', child.element.textContent);
		});

		it('should be able to render a child without wrapper element', function() {
			class ChildComponent extends JSXComponent {
				render() {
					return this.children[1];
				}
			}

			class TestComponent extends JSXComponent {
				render() {
					return (
						<div class="test">
							<ChildComponent ref="child">
								<span>Children Test</span>
								<span>Children Test 2</span>
								<span>Children Test 3</span>
							</ChildComponent>
						</div>
					);
				}
			}

			component = new TestComponent();
			var child = component.components.child;
			assert.strictEqual('SPAN', child.element.tagName);
			assert.strictEqual(1, child.element.childNodes.length);
			assert.strictEqual('Children Test 2', child.element.textContent);
		});

		it('should be able to get the data passed to children', function() {
			class ChildComponent extends JSXComponent {
				render() {
					return <div class="child">
						{this.children[0].config.foo}
						{this.children}
					</div>;
				}
			}

			class TestComponent extends JSXComponent {
				render() {
					return (
						<div class="test">
							<ChildComponent ref="child">
								<span foo="foo">Children Test</span>
							</ChildComponent>
						</div>
					);
				}
			}

			component = new TestComponent();
			var child = component.components.child;
			assert.strictEqual(2, child.element.childNodes.length);
			assert.strictEqual('foo', child.element.childNodes[0].textContent);
			assert.strictEqual('SPAN', child.element.childNodes[1].tagName);
			assert.strictEqual('Children Test', child.element.childNodes[1].textContent);
		});
	});

	describe('JSXComponent.render', function() {
		it('should create and render components via "JSXComponent.render"', function() {
			class TestComponent extends JSXComponent {
				render() {
					return <div class="test">{this.config.foo}</div>;
				}
			}

			var container = document.createElement('div');
			component = JSXComponent.render(
				TestComponent,
				{
					foo: 'fooValue'
				},
				container
			);

			assert.ok(component instanceof TestComponent);
			assert.strictEqual(1, container.childNodes.length);
			assert.strictEqual(component.element, container.childNodes[0]);
			assert.strictEqual('DIV', component.element.tagName);
			assert.ok(dom.hasClass(component.element, 'test'));
			assert.strictEqual('fooValue', component.element.textContent);
		});

		it('should render componentless functions via "JSXComponent.render"', function() {
			var fn = config => {
				return <div class="test">{config.foo}</div>;
			}
			var container = document.createElement('div');
			JSXComponent.render(
				fn,
				{
					foo: 'fooValue'
				},
				container
			);

			assert.strictEqual(1, container.childNodes.length);
			assert.strictEqual('DIV', container.childNodes[0].tagName);
			assert.ok(dom.hasClass(container.childNodes[0], 'test'));
			assert.strictEqual('fooValue', container.childNodes[0].textContent);
		});

		it('should render jsx element via "JSXComponent.render"', function() {
			var container = document.createElement('div');
			JSXComponent.render(
				<div class="test">foo</div>,
				container
			);

			assert.strictEqual(1, container.childNodes.length);
			assert.strictEqual('DIV', container.childNodes[0].tagName);
			assert.ok(dom.hasClass(container.childNodes[0], 'test'));
			assert.strictEqual('foo', container.childNodes[0].textContent);
		});
	});
});
