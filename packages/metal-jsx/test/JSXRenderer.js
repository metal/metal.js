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

	it('should reuse child empty component when it renders content for the first time', function(done) {
		class Wrapper extends TestJSXComponent {
			render() {
				return this.props.children;
			}
		}

		const childInstances = [];
		class Child extends TestJSXComponent {
			created() {
				childInstances.push(this);
			}

			render() {
				return this.state.show ? <span>Child</span> : null;
			}
		}
		Child.STATE = {
			show: {
			}
		};

		class TestComponent extends TestJSXComponent {
			render() {
				return <Wrapper>
					<div class="root">
						<Child />
					</div>
				</Wrapper>;
			}
		}

		const element = document.createElement('div');
		dom.enterDocument(element);
		component = new TestComponent({
			element
		});
		assert.strictEqual(1, childInstances.length);
		const child = childInstances[0];

		child.state.show = true;
		child.once('stateSynced', function() {
			assert.strictEqual(1, childInstances.length);
			assert.ok(!child.isDisposed());
			assert.equal('Child', child.element.textContent);
			assert.equal(child.element, component.element.childNodes[0]);
			done();
		});
	});

	it('should reuse child empty component when its parent makes it render content for the first time', function(done) {
		class Wrapper extends TestJSXComponent {
			render() {
				return this.props.children;
			}
		}

		const childInstances = [];
		class Child extends TestJSXComponent {
			created() {
				childInstances.push(this);
			}

			render() {
				return this.props.show ? <span>Child</span> : null;
			}
		}

		class TestComponent extends TestJSXComponent {
			render() {
				return <Wrapper>
					<div class="root">
						<Child show={this.state.show} />
					</div>
				</Wrapper>;
			}
		}
		TestComponent.STATE = {
			show: {
			}
		};

		const element = document.createElement('div');
		dom.enterDocument(element);
		component = new TestComponent({
			element
		});
		assert.strictEqual(1, childInstances.length);
		const child = childInstances[0];

		component.state.show = true;
		component.once('stateSynced', function() {
			assert.strictEqual(1, childInstances.length);
			assert.ok(!child.isDisposed());
			assert.equal('Child', child.element.textContent);
			assert.equal(child.element, component.element.childNodes[0]);
			done();
		});
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
			shouldUpdate() {}
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

	it('should reuse elements correctly when child skips update', function(done) {
		class ChildComponent extends TestJSXComponent {
			render() {
				return <span>Child</span>
			}

			shouldUpdate() {
				return false;
			}
		}

		class TestComponent extends TestJSXComponent {
			render() {
				return <div>
					<ChildComponent />
					<span>{this.state.foo}</span>
				</div>;
			}
		}
		TestComponent.STATE = {
			foo: {
			}
		}

		component = new TestComponent();
		var childNodes = component.element.childNodes;
		assert.equal(2, childNodes.length);

		component.state.foo = 'foo';
		component.once('stateChanged', function() {
			assert.equal(2, component.element.childNodes.length);
			assert.equal(childNodes[0], component.element.childNodes[0]);
			assert.equal(childNodes[1], component.element.childNodes[1]);
			assert.equal('foo', childNodes[1].textContent);
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

	it('should reuse components with keys after moving around', function(done) {
		const childComps = [];
		class ChildComponent extends TestJSXComponent {
			created() {
				childComps.push(this);
			}
			render() {
				return <div>Child{this.props.key}</div>;
			}
		}

		class TestComponent extends TestJSXComponent {
			render() {
				return <div>
					<ChildComponent key={this.props.switch ? 'child2' : 'child1'} />
					<ChildComponent key={this.props.switch ? 'child1' : 'child2'} />
				</div>
			}
		}
		TestComponent.PROPS = {
			switch: {
			}
		}

		component = new TestComponent();
		assert.equal(2, childComps.length);
		const firstChild = component.element.childNodes[0];
		const secondChild = component.element.childNodes[1];
		assert.equal(firstChild, childComps[0].element);
		assert.equal(secondChild, childComps[1].element);

		component.props.switch = true;
		component.once('stateSynced', function() {
			assert.equal(secondChild, component.element.childNodes[0]);
			assert.equal(firstChild, component.element.childNodes[1]);
			assert.equal(2, childComps.length);
			assert.equal(firstChild, childComps[0].element);
			assert.equal(secondChild, childComps[1].element);
			done();
		});
	});

	it('should rerender sub component correctly after an update', function(done) {
		class ChildComponent extends TestJSXComponent {
			render() {
				return <div>{this.props.foo}</div>;
			}
		}
		ChildComponent.PROPS = {
			foo: {
				value: 'initialFoo'
			}
		};

		class TestComponent extends TestJSXComponent {
			render() {
				return <div>
					<div>Test</div>
					<ChildComponent ref="child" />
				</div>
			}
		}

		component = new TestComponent();

		component.components.child.props.foo = 'newFoo';
		component.components.child.once('stateSynced', function() {
			assert.strictEqual('Test', component.element.childNodes[0].textContent);
			assert.strictEqual('newFoo', component.element.childNodes[1].textContent);
			done();
		});
	});

	it('should reuse elements correctly after a child update', function(done) {
		class ChildComponent extends TestJSXComponent {
			render() {
				return <div><span>{this.props.foo}</span></div>;
			}
		}
		ChildComponent.PROPS = {
			foo: {
				value: 'initialFoo'
			}
		};

		class TestComponent extends TestJSXComponent {
			render() {
				return <ChildComponent ref="child" />;
			}
		}

		component = new TestComponent();
		const child = component.refs.child;
		var spanEl = child.element.childNodes[0];

		component.refs.child.props.foo = 'newFoo';
		component.refs.child.once('stateSynced', function() {
			assert.strictEqual(spanEl, child.element.childNodes[0]);
			done();
		});
	});

	it('should reuse elements correctly after update from previously empty child', function(done) {
		let child;
		class ChildComponent extends TestJSXComponent {
			created() {
				child = this;
			}

			render() {
				return this.state.first ? null : <div>Child</div>;
			}
		}
		ChildComponent.STATE = {
			first: {
				value: true
			}
		};

		class TestComponent extends TestJSXComponent {
			render() {
				return <div>
					<div>First child element</div>
					<ChildComponent />
				</div>;
			}
		}

		component = new TestComponent();
		const firstEl = component.element.childNodes[0];
		child.state.first = false;
		child.once('stateSynced', function() {
			assert.strictEqual(firstEl, component.element.childNodes[0]);
			done();
		});
	});
});
