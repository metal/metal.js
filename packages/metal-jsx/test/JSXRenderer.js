'use strict';

import dom from 'metal-dom';
import Component from 'metal-component';
import JSXRenderer from '../src/JSXRenderer';
import JSXDataManager from '../src/JSXDataManager';

describe('JSXRenderer', function() {
	let component;
	let createdComps;
	let TestJSXComponent;

	beforeEach(function() {
		createdComps = [];
		class TestJSXComponentCtor extends Component {
			created() {
				createdComps.push(this);
			}
		}
		TestJSXComponentCtor.DATA_MANAGER = JSXDataManager;
		TestJSXComponentCtor.RENDERER = JSXRenderer;
		TestJSXComponent = TestJSXComponentCtor;
	});

	afterEach(function() {
		if (component) {
			component.dispose();
		}
	});

	it('should render returned contents from variable in "render" function', function() {
		class TestComponent extends TestJSXComponent {
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

	it('should be able to render a child without wrapper element', function() {
		class ChildComponent extends TestJSXComponent {
			render() {
				return this.props.children[1];
			}
		}

		class TestComponent extends TestJSXComponent {
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

	it('should update if props change', function(done) {
		class TestComponent extends TestJSXComponent {
			render() {
				return <div>{this.props.foo}</div>
			}
		}
		TestComponent.PROPS = {
			foo: {
				value: 'defaultFoo'
			}
		}

		component = new TestComponent();
		assert.strictEqual('defaultFoo', component.element.textContent);

		component.props.foo = 'foo';
		component.once('rendered', function() {
			assert.strictEqual('foo', component.element.textContent);
			done();
		});
	});

	it('should update if state changes', function(done) {
		class TestComponent extends TestJSXComponent {
			render() {
				return <div>{this.state.foo}</div>
			}
		}
		TestComponent.STATE = {
			foo: {
				value: 'defaultFoo'
			}
		}

		component = new TestComponent();
		assert.strictEqual('defaultFoo', component.element.textContent);

		component.state.foo = 'foo';
		component.once('rendered', function() {
			assert.strictEqual('foo', component.element.textContent);
			done();
		});
	});

	it('should pass both state and prop changes to shouldUpdate', function(done) {
		class TestComponent extends TestJSXComponent {
			shouldUpdate() {
			}
		}
		TestComponent.PROPS = {
			bar: {
			}
		}
		TestComponent.STATE = {
			foo: {
			}
		}

		component = new TestComponent();
		sinon.stub(component, 'shouldUpdate');
		component.props.bar = 'bar';
		component.state.foo = 'foo';
		component.once('stateChanged', function() {
			assert.strictEqual(1, component.shouldUpdate.callCount);

			const stateChanges = component.shouldUpdate.args[0][0];
			assert.ok(stateChanges.foo);
			assert.strictEqual('foo', stateChanges.foo.newVal);
			assert.strictEqual(undefined, stateChanges.foo.prevVal);

			const propChanges = component.shouldUpdate.args[0][1];
			assert.ok(propChanges.bar);
			assert.strictEqual('bar', propChanges.bar.newVal);
			assert.strictEqual(undefined, propChanges.bar.prevVal);

			done();
		});
	});

	it('should reuse component rendered after a conditionally rendered component', function(done) {
		class ChildComponent extends TestJSXComponent {
			render() {
				return <span>Child</span>;
			}
		}

		class ChildComponent2 extends ChildComponent {
		}

		class TestComponent extends TestJSXComponent {
			render() {
				return <div>
					{!this.props.hide && <div class="child1"><ChildComponent /></div>}
					<div class="child1"><ChildComponent2 /></div>
				</div>
			}
		}
		TestComponent.PROPS = {
			hide: {
			}
		}

		class ParentComponent extends TestJSXComponent {
			render() {
				return <div><TestComponent /></div>;
			}
		}

		component = new ParentComponent();
		assert.strictEqual(4, createdComps.length);
		assert.ok(createdComps[0] instanceof ParentComponent);
		assert.ok(createdComps[1] instanceof TestComponent);
		assert.ok(createdComps[2] instanceof ChildComponent);
		assert.ok(createdComps[3] instanceof ChildComponent2);
		assert.ok(!createdComps[0].isDisposed());
		assert.ok(!createdComps[1].isDisposed());
		assert.ok(!createdComps[2].isDisposed());
		assert.ok(!createdComps[3].isDisposed());

		createdComps[1].props.hide = true;
		createdComps[1].once('stateSynced', function() {
			assert.strictEqual(4, createdComps.length);
			assert.ok(!createdComps[0].isDisposed());
			assert.ok(!createdComps[1].isDisposed());
			assert.ok(createdComps[2].isDisposed());
			assert.ok(!createdComps[3].isDisposed());
			done();
		});
	});

	it('should reuse elements with keys after moving around', function(done) {
		class TestComponent extends TestJSXComponent {
			render() {
				return <div>
					<span key={this.props.switch ? 'node2' : 'node1'} />
					<span key={this.props.switch ? 'node1' : 'node2'} />
				</div>
			}
		}
		TestComponent.PROPS = {
			switch: {
			}
		}

		component = new TestComponent();
		const firstChild = component.element.childNodes[0];
		const secondChild = component.element.childNodes[1];

		component.props.switch = true;
		component.once('stateSynced', function() {
			assert.strictEqual(secondChild, component.element.childNodes[0]);
			assert.strictEqual(firstChild, component.element.childNodes[1]);
			done();
		});
	});
});
