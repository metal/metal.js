'use strict';

import dom from '../../src/dom/dom';
import DomVisitor from '../../src/dom/DomVisitor';

describe('DomVisitor', function() {
  it('should return DomVisitor instance when DomVisitor.visit is called', function() {
    var element = document.createElement('div');
    assert.ok(DomVisitor.visit(element) instanceof DomVisitor);
  });

  it('should run added handler for each element in dom tree', function() {
    var element = document.createElement('div');
    var child1 = document.createElement('div');
    var child2 = document.createElement('div');
    var child3 = document.createElement('div');
    dom.append(element, child1);
    dom.append(element, child2);
    dom.append(child2, child3);

    var handler = sinon.stub();

    DomVisitor.visit(element)
      .addHandler(handler)
      .start();

    assert.strictEqual(4, handler.callCount);
    assert.strictEqual(element, handler.args[0][0]);
    assert.strictEqual(child1, handler.args[1][0]);
    assert.strictEqual(child2, handler.args[2][0]);
    assert.strictEqual(child3, handler.args[3][0]);
  });

  it('should run added handlers in the order they were added', function() {
    var element = document.createElement('div');

    var handler1 = sinon.stub();
    var handler2 = sinon.stub();

    DomVisitor.visit(element)
      .addHandler(handler1)
      .addHandler(handler2)
      .start();

    handler1.calledBefore(handler2);
  });

  it('should pass requested initial data to handlers when called for the first time', function() {
    var element = document.createElement('div');
    var child1 = document.createElement('div');
    dom.append(element, child1);

    var handler1 = sinon.stub();
    var handler2 = sinon.stub();

    DomVisitor.visit(element)
      .addHandler(handler1, 1)
      .addHandler(handler2, 2)
      .start();

    assert.strictEqual(1, handler1.args[0][1]);
    assert.strictEqual(undefined, handler1.args[1][1]);
    assert.strictEqual(2, handler2.args[0][1]);
    assert.strictEqual(undefined, handler2.args[1][1]);
  });

  it('should pass data returned from handlers down the tree', function() {
    var element = document.createElement('div');
    var child1 = document.createElement('div');
    dom.append(element, child1);

    var handler1 = sinon.stub().returns(10);
    var handler2 = sinon.stub().returns(20);

    DomVisitor.visit(element)
      .addHandler(handler1, 1)
      .addHandler(handler2, 2)
      .start();

    assert.strictEqual(1, handler1.args[0][1]);
    assert.strictEqual(10, handler1.args[1][1]);
    assert.strictEqual(2, handler2.args[0][1]);
    assert.strictEqual(20, handler2.args[1][1]);
  });

  it('should throw error if trying to start visit after being disposed', function() {
    var element = document.createElement('div');

    var visitor = DomVisitor.visit(element).addHandler(sinon.stub());
    visitor.dispose();

    assert.throws(function() {
      visitor.start();
    });
  });
});
