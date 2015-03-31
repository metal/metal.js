'use strict';

import dom from '../../../src/dom/dom';
import Component from '../../../src/component/Component';
import ComponentRegistry from '../../../src/component/ComponentRegistry';
import ComponentCollector from '../../../src/component/ComponentCollector';

class TestComponent extends Component {
  constructor(opt_config) {
    super(opt_config);
  }
}
ComponentRegistry.register('TestComponent', TestComponent);
TestComponent.ATTRS = {
  bar: {}
};

describe('ComponentCollector', function() {
  beforeEach(function() {
    sinon.stub(console, 'warn');
    document.body.innerHTML = '';
    ComponentCollector.components = {};
  });

  afterEach(function() {
    console.warn.restore();
  });

  it('should instantiate a new component', function() {
    var element = document.createElement('div');
    element.setAttribute('id', 'comp');
    dom.append(document.body, element);

    var collector = new ComponentCollector();
    var data = {
      bar: 1,
      id: 'comp'
    };
    var component = collector.createOrUpdateComponent('TestComponent', data);

    assert.ok(component instanceof TestComponent);
    assert.strictEqual(1, component.bar);
    assert.strictEqual(element, component.element);
  });

  it('should update an existing component', function() {
    var element = document.createElement('div');
    element.setAttribute('id', 'comp');
    dom.append(document.body, element);

    var collector = new ComponentCollector();
    var data = {
      bar: 1,
      id: 'comp'
    };
    var component = collector.createOrUpdateComponent('TestComponent', data);

    data.bar = 2;
    var updatedComponent = collector.createOrUpdateComponent('TestComponent', data);

    assert.strictEqual(component, updatedComponent);
    assert.strictEqual(2, component.bar);
    assert.strictEqual(element, component.element);
  });

  it('should extract components from a string', function() {
    var collector = new ComponentCollector();
    var child1 = collector.createOrUpdateComponent('TestComponent', {id: 'child1'});
    var child2 = collector.createOrUpdateComponent('TestComponent', {id: 'child2'});

    var childrenString = '%%%%~comp-child1~%%%%%%%%~comp-child2~%%%%';
    var components = collector.extractComponentsFromString(childrenString);

    assert.strictEqual(2, components.length);
    assert.ok(child1, components[0]);
    assert.ok(child2, components[1]);
  });
});
