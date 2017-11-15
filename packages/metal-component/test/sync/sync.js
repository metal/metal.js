'use strict';

import Component from '../../src/Component';
import {syncState} from '../../src/sync/sync';

describe('sync', function() {
	let comp;

	afterEach(function() {
		if (comp) {
			comp.dispose();
		}
	});

	it('should call all "sync" methods on component', function() {
		class TestComponent extends Component {}
		TestComponent.STATE = {
			bar: {
				value: 'bar',
			},
			foo: {
				value: 'foo',
			},
		};
		TestComponent.prototype.syncBar = sinon.stub();
		TestComponent.prototype.syncFoo = sinon.stub();

		comp = new TestComponent({}, false);
		syncState(comp);
		assert.equal(1, comp.syncBar.callCount);
		assert.equal('bar', comp.syncBar.args[0][0]);
		assert.equal(undefined, comp.syncBar.args[0][1]);
		assert.equal(1, comp.syncFoo.callCount);
		assert.equal('foo', comp.syncFoo.args[0][0]);
		assert.equal(undefined, comp.syncFoo.args[0][1]);
	});

	it('should call "sync" method for properties defined in changes object', function() {
		class TestComponent extends Component {}
		TestComponent.STATE = {
			bar: {
				value: 'bar',
			},
			foo: {
				value: 'foo',
			},
		};
		TestComponent.prototype.syncBar = sinon.stub();
		TestComponent.prototype.syncFoo = sinon.stub();

		comp = new TestComponent({}, false);
		syncState(comp, {
			foo: {
				newVal: 'newFoo',
				prevVal: 'prevFoo',
			},
		});
		assert.equal(0, comp.syncBar.callCount);
		assert.equal(1, comp.syncFoo.callCount);
		assert.equal('newFoo', comp.syncFoo.args[0][0]);
		assert.equal('prevFoo', comp.syncFoo.args[0][1]);
	});

	it('should call "sync" methods that are not defined in the prototype', function() {
		class TestComponent extends Component {
			created() {
				this.syncFoo = sinon.stub();
			}
		}
		TestComponent.STATE = {
			foo: {
				value: 'foo',
			},
		};

		comp = new TestComponent({}, false);
		syncState(comp);
		assert.equal(1, comp.syncFoo.callCount);
		assert.equal('foo', comp.syncFoo.args[0][0]);
		assert.equal(undefined, comp.syncFoo.args[0][1]);
	});
});
