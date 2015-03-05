'use strict';

import dom from '../../src/dom/dom';
import Component from '../../src/component/Component';
import ComponentRegistry from '../../src/component/ComponentRegistry';
import ComponentCollector from '../../src/component/ComponentCollector';

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
  it('should not create components on element without data-component attribute', function() {
    var element = document.createElement('div');

    var collector = new ComponentCollector();
    collector.extractComponents(element, {});

    assert.deepEqual({}, collector.getComponents());
  });

  it('should not create components on element without their creation data', function() {
    var element = document.createElement('div');
    element.setAttribute('data-component', true);
    element.setAttribute('data-ref', 'comp');

    var collector = new ComponentCollector();
    collector.extractComponents(element, {});

    assert.deepEqual({}, collector.getComponents());
  });

  it('should instantiate extracted components', function() {
    var parent = document.createElement('div');
    var element = document.createElement('div');
    element.setAttribute('data-component', true);
    element.setAttribute('data-ref', 'comp');
    dom.append(parent, element);

    var collector = new ComponentCollector();
    var creationData = {
      data: {
        bar: 1
      },
      name: 'TestComponent',
      ref: 'comp'
    };
    collector.extractComponents(element, {comp: creationData});

    var components = collector.getComponents();
    assert.strictEqual(1, Object.keys(components).length);
    assert.ok(components.comp instanceof TestComponent);
    assert.strictEqual(1, components.comp.bar);
  });

  it('should update extracted component instances', function() {
    var parent = document.createElement('div');
    var element = document.createElement('div');
    element.setAttribute('data-component', true);
    element.setAttribute('data-ref', 'comp');
    dom.append(parent, element);

    var collector = new ComponentCollector();
    var creationData = {
      data: {
        bar: 1
      },
      name: 'TestComponent',
      ref: 'comp'
    };
    collector.extractComponents(element, {comp: creationData});

    parent.innerHTML = '';
    dom.append(parent, element);
    creationData.data.bar = 2;
    collector.extractComponents(element, {comp: creationData});

    var components = collector.getComponents();
    assert.strictEqual(1, Object.keys(components).length);
    assert.ok(components.comp instanceof TestComponent);
    assert.strictEqual(2, components.comp.bar);
  });
});
