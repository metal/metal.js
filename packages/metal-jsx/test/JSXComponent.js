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

	it('should receive props from parent components', function() {
		class ChildComponent extends JSXComponent {
			render() {
				return <div class="child">{this.props.foo}</div>;
			}
		}

		class TestComponent extends JSXComponent {
			render() {
				return <div class="test">
					<ChildComponent ref="child" foo="Foo" />
				</div>;
			}
		}

		component = new TestComponent();
		var child = component.components.child;
		assert.strictEqual('Foo', child.element.textContent);
	});

	describe('Children', function() {
		it('should be able to render children through props', function() {
			class ChildComponent extends JSXComponent {
				render() {
					return <div>{this.props.children}</div>;
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
					return <div>{this.props.children}</div>;
				}
			}

			component = new TestComponent();
			assert.strictEqual(0, component.element.childNodes.length);
			assert.ok(component.props.children);
			assert.strictEqual(0, component.props.children.length);
		});

		it('should be able to render only some of the received children', function() {
			class ChildComponent extends JSXComponent {
				render() {
					return <div class="child">
						{this.props.children[1]}
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

		it('should be able to get the data passed to children', function() {
			class ChildComponent extends JSXComponent {
				render() {
					return <div class="child">
						{this.props.children[0].config.foo}
						{this.props.children}
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
					return <div class="test">{this.props.foo}</div>;
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
			var fn = props => {
				return <div class="test">{props.foo}</div>;
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

	describe('STATE and PROPS', function() {
		it('should allow specifying configuration for props', function() {
			class TestComponent extends JSXComponent {
			}
			TestComponent.PROPS = {
				foo: {
					value: 'defaultFoo'
				}
			}

			component = new TestComponent();
			assert.strictEqual('defaultFoo', component.props.foo);
		});

		it('should allow specifying internal state', function() {
			class TestComponent extends JSXComponent {
			}
			TestComponent.STATE = {
				foo: {
					value: 'defaultFoo'
				}
			}

			component = new TestComponent();
			assert.strictEqual('defaultFoo', component.state.foo);
		});

		it('should call "propsChanged" when new props are passed', function(done) {
			class ChildComponent extends JSXComponent {
				render() {
					return <div class="child">{this.props.foo}</div>;
				}
			}
			ChildComponent.prototype.propsChanged = sinon.stub();

			class TestComponent extends JSXComponent {
				render() {
					return <ChildComponent ref="child" foo={this.state.foo} />;
				}
			}
			TestComponent.STATE = {
				foo: {
					value: 'foo'
				}
			};

			component = new TestComponent();
			var child = component.components.child;

			component.state.foo = 'foo2';
			component.once('rendered', function() {
				assert.strictEqual('foo2', child.element.textContent);
				assert.strictEqual(1, child.propsChanged.callCount);

				var prevProps = child.propsChanged.args[0][0];
				assert.strictEqual('foo', prevProps.foo);
				assert.strictEqual('foo2', child.props.foo);
				done();
			});
		});
	});

	describe('shouldUpdate', function() {
		it('should not rerender after props change if shouldUpdate returns false', function(done) {
			class TestComponent extends JSXComponent {
				render() {
				}

				shouldUpdate() {
					return false;
				}
			}
			TestComponent.PROPS = {
				foo: {
					value: 'defaultFoo'
				}
			}
			component = new TestComponent();

			sinon.stub(component, 'render');
			component.props.foo = 'foo';
			component.once('stateChanged', function() {
				assert.strictEqual(0, component.render.callCount);
				done();
			});
		});

		it('should not rerender after state change if shouldUpdate returns false', function(done) {
			class TestComponent extends JSXComponent {
				render() {
				}

				shouldUpdate() {
					return false;
				}
			}
			TestComponent.STATE = {
				foo: {
					value: 'defaultFoo'
				}
			}
			component = new TestComponent();

			sinon.stub(component, 'render');
			component.state.foo = 'foo';
			component.once('stateChanged', function() {
				assert.strictEqual(0, component.render.callCount);
				done();
			});
		});
	});
});
