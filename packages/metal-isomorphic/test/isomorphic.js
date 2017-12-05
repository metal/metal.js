import Component from 'metal-component';
import MyComponent from './fixtures/MyComponent';
import MyJSXComponent from './fixtures/MyJSXComponent';
import ParentComponent from './fixtures/ParentComponent';
import {assert} from 'chai';
import {spy} from 'sinon';
import jsdomGlobal from 'jsdom-global';

const lifecycleList = ['created', 'rendered', 'willAttach', 'attached',
  'willReceiveState', 'willReceiveProps', 'shouldUpdate',
  'willUpdate', 'willDetach', 'detached', 'disposed'
];

describe('Isomorphic Rendering', () => {
	it('should render soy component to string', () => {
		assert.ok(!global.document);

		const htmlString = Component.renderToString(MyComponent, {
			message: 'Hello, Soy!',
		});

		assert.equal(htmlString, '<div>Hello, Soy!</div>');
  });

	it('should render jsx component to string', () => {
		assert.ok(!global.document);

		const htmlString = Component.renderToString(MyJSXComponent, {
			message: 'Hello, JSX!',
		});

		assert.equal(htmlString, '<div>Hello, JSX!</div>');
  });

  it('it should only perform willAttach lifecycle when not performing on DOM environment', () => {
    assert.ok(!global.document);

    const spies = lifecycleList.reduce((acc, cvalue) => {
      acc[cvalue] = spy();
      MyJSXComponent.prototype[cvalue] = acc[cvalue];
      return acc;
    }, {});

    const htmlString = Component.renderToString(MyJSXComponent, {
			message: 'Hello, JSX!',
    });

    assert.equal(htmlString, '<div>Hello, JSX!</div>');
    assert.ok(spies['created'].notCalled);
    assert.ok(spies['rendered'].notCalled);
    assert.ok(spies['willAttach'].calledOnce);
    assert.ok(spies['attached'].notCalled);
    assert.ok(spies['willReceiveState'].notCalled);
    assert.ok(spies['willReceiveProps'].notCalled);
    assert.ok(spies['shouldUpdate'].notCalled);
    assert.ok(spies['willUpdate'].notCalled);
    assert.ok(spies['willDetach'].notCalled);
    assert.ok(spies['detached'].notCalled);
    assert.ok(spies['disposed'].notCalled);
  });

	it('should render soy component with subcomponents to string', () => {
		assert.ok(!global.document);

		const htmlString = Component.renderToString(ParentComponent, {
			message: 'Hello, World!'
		});

		assert.equal(htmlString, '<div><div>Child: Hello, World!</div></div>');
	});

	describe('JSDom', () => {
		let cleanup;

		before(() => {
			cleanup = jsdomGlobal();
		});

		after(() => {
			cleanup();
		});

		it('should render soy component to string', () => {
			assert.ok(document);

			const htmlString = Component.renderToString(MyComponent, {
				message: 'Hello, Soy!'
			});

			assert.equal(htmlString, '<div>Hello, Soy!</div>');
		});

		it('should render soy component to DOM', () => {
			assert.ok(document);

			const comp = new MyComponent({
				message: 'Hello, Soy!'
			});

			assert.equal(comp.element.innerHTML, '<div>Hello, Soy!</div>');
    });

    it('it should perform all the lifecycles when performing on DOM environment', () => {
      assert.ok(global.document);

      const spies = lifecycleList.reduce((acc, cvalue) => {
        acc[cvalue] = spy();
        MyJSXComponent.prototype[cvalue] = acc[cvalue];
        return acc;
      }, {});

      const htmlString = Component.renderToString(MyJSXComponent, {
        message: 'Hello, JSX!',
      });

      assert.equal(htmlString, '<div>Hello, JSX!</div>');
      assert.ok(spies['created'].calledOnce);
      assert.ok(spies['rendered'].calledOnce);
      assert.ok(spies['willAttach'].calledOnce);
      assert.ok(spies['attached'].calledOnce);
      assert.ok(spies['willReceiveState'].notCalled);
      assert.ok(spies['willReceiveProps'].notCalled);
      assert.ok(spies['shouldUpdate'].notCalled);
      assert.ok(spies['willUpdate'].notCalled);
      assert.ok(spies['willDetach'].calledOnce);
      assert.ok(spies['detached'].calledOnce);
      assert.ok(spies['disposed'].calledOnce);
    });

		it('should render jsx component to string', () => {
			assert.ok(document);

			const htmlString = Component.renderToString(MyJSXComponent, {
				message: 'Hello, JSX!'
			});

			assert.equal(htmlString, '<div>Hello, JSX!</div>');
		});

		it('should render JSX component to DOM', () => {
			assert.ok(document);

			const comp = new MyJSXComponent({
				message: 'Hello, Soy!'
			});

			assert.equal(comp.element.innerHTML, '<div>Hello, Soy!</div>');
		});
	});
});
