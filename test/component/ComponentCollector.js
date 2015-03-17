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
  beforeEach(function() {
    sinon.stub(console, 'warn');
    document.body.innerHTML = '';
  });

  afterEach(function() {
    console.warn.restore();
  });

  it('should not create components on element without data-component attribute', function() {
    var element = createComponentElement();
    element.removeAttribute('data-component');

    var collector = new ComponentCollector(element);
    collector.extractComponents({});

    assert.deepEqual({}, collector.getComponents());
  });

  it('should not create components on element without their creation data', function() {
    var element = createComponentElement();

    var collector = new ComponentCollector(element);
    collector.extractComponents({});

    assert.deepEqual({}, collector.getComponents());
  });

  it('should not create components on element if placeholder can\'t be found', function() {
    var collector = new ComponentCollector(document.createElement('div'));
    collector.extractComponents({comp: {}});

    assert.deepEqual({}, collector.getComponents());
  });

  it('should instantiate extracted components', function() {
    var parent = document.createElement('div');
    var element = createComponentElement(parent);

    var collector = new ComponentCollector(element);
    var creationData = {
      data: {
        bar: 1,
        id: 'comp'
      },
      componentName: 'TestComponent'
    };
    collector.extractComponents({comp: creationData});

    var components = collector.getComponents();
    assert.strictEqual(1, Object.keys(components).length);
    assert.ok(components.comp instanceof TestComponent);
    assert.strictEqual(1, components.comp.bar);
    assert.strictEqual(element, components.comp.element);
    assert.strictEqual(parent, components.comp.element.parentNode);
  });

  it('should render new extracted components', function() {
    var parent = document.createElement('div');
    var element = createComponentElement(parent);

    var collector = new ComponentCollector(element);
    var creationData = {
      data: {id: 'comp'},
      componentName: 'TestComponent'
    };
    collector.extractComponents({comp: creationData});

    var components = collector.getComponents();
    assert.ok(components.comp.wasRendered);
    assert.ok(!components.comp.wasDecorated);
  });

  it('should decorate new extracted component if setShouldDecorate is called with true', function() {
    var parent = document.createElement('div');
    var element = createComponentElement(parent);
    dom.append(element, 'Some Content');

    var collector = new ComponentCollector(element);
    var creationData = {
      data: {id: 'comp'},
      componentName: 'TestComponent'
    };
    collector.setShouldDecorate(true);
    collector.extractComponents({comp: creationData});

    var components = collector.getComponents();
    assert.ok(components.comp.wasRendered);
    assert.ok(components.comp.wasDecorated);
  });

  it('should not decorate new extracted component when element has no content', function() {
    var parent = document.createElement('div');
    var element = createComponentElement(parent);

    var collector = new ComponentCollector(element);
    var creationData = {
      data: {id: 'comp'},
      componentName: 'TestComponent'
    };
    collector.setShouldDecorate(true);
    collector.extractComponents({comp: creationData});

    var components = collector.getComponents();
    assert.ok(components.comp.wasRendered);
    assert.ok(!components.comp.wasDecorated);
  });

  it('should update existing extracted component', function() {
    var parent = document.createElement('div');
    var element = createComponentElement(parent);

    var collector = new ComponentCollector(element);
    var creationData = {
      data: {
        bar: 1,
        id: 'comp'
      },
      componentName: 'TestComponent',
      ref: 'comp'
    };
    collector.extractComponents({comp: creationData});

    creationData.data.bar = 2;
    collector.extractComponents({comp: creationData});

    var components = collector.getComponents();
    assert.strictEqual(2, components.comp.bar);
    assert.strictEqual(element, components.comp.element);
    assert.strictEqual(parent, components.comp.element.parentNode);
  });

  it('should reposition existing component if extracted from a different element', function() {
    var parent = document.createElement('div');
    var element = createComponentElement(parent);

    var collector = new ComponentCollector(element);
    var creationData = {
      data: {
        bar: 1,
        id: 'comp'
      },
      componentName: 'TestComponent'
    };
    collector.extractComponents({comp: creationData});

    parent.removeChild(element);
    var parent2 = document.createElement('div');
    createComponentElement(parent2);
    collector.extractComponents({comp: creationData});

    var components = collector.getComponents();
    assert.strictEqual(element, components.comp.element);
    assert.strictEqual(parent2, components.comp.element.parentNode);
  });

  it('should instantiate extracted component children', function() {
    var element = createComponentElement();

    var collector = new ComponentCollector(element);
    var creationData = {
      child1: {
        data: {id: 'child1'},
        componentName: 'TestComponent'
      },
      child2: {
        data: {
          children: '<div data-component id="child1"></div>',
          id: 'child2'
        },
        componentName: 'TestComponent'
      },
      comp: {
        data: {
          children: '<div data-component id="child2"></div>',
          id: 'comp'
        },
        componentName: 'TestComponent'
      }
    };
    collector.extractComponents(creationData);

    var components = collector.getComponents();
    assert.strictEqual(3, Object.keys(components).length);
    assert.ok(components.comp instanceof TestComponent);
    assert.ok(components.child1 instanceof TestComponent);
    assert.ok(components.child2 instanceof TestComponent);
    assert.deepEqual([components.child2], components.comp.children);
    assert.deepEqual([components.child1], components.child2.children);
  });

  it('should update extracted component children instances', function() {
    var parent = document.createElement('div');
    var element = createComponentElement(parent);

    var collector = new ComponentCollector(element);
    var creationData = {
      child1: {
        data: {id: 'child1'},
        componentName: 'TestComponent'
      },
      comp: {
        data: {
          children: '<div data-component id="child1"></div>',
          id: 'comp'
        },
        componentName: 'TestComponent'
      }
    };
    var components = collector.getComponents();
    collector.extractComponents(creationData);
    assert.strictEqual(undefined, components.child1.bar);

    creationData = {
      child1: {
        data: {
          bar: 'child1',
          id: 'child1'
        },
        componentName: 'TestComponent'
      },
      comp: {
        data: {
          children: '<div data-component id="child1"></div>',
          id: 'comp'
        },
        componentName: 'TestComponent'
      }
    };
    collector.extractComponents(creationData);
    assert.strictEqual('child1', components.child1.bar);
  });

  it('should keep the original value of non component config strings', function() {
    var element = createComponentElement();

    var collector = new ComponentCollector(element);
    var creationData = {
      comp: {
        data: {
          bar: 'I have a data-component.',
          id: 'comp'
        },
        componentName: 'TestComponent'
      }
    };
    collector.extractComponents(creationData);

    var components = collector.getComponents();
    assert.strictEqual(1, Object.keys(components).length);
    assert.ok(components.comp instanceof TestComponent);
    assert.strictEqual('I have a data-component.', components.comp.bar);
  });

  it('should ignore non component elements on component attribute', function() {
    var element = createComponentElement();

    var collector = new ComponentCollector(element);
    var creationData = {
      child1: {
        data: {id: 'child1'},
        componentName: 'TestComponent'
      },
      comp: {
        data: {
          children: '<span>Ignore</span><div data-component id="child1"></div>',
          id: 'comp'
        },
        componentName: 'TestComponent'
      }
    };
    collector.extractComponents(creationData);

    var components = collector.getComponents();
    assert.strictEqual(2, Object.keys(components).length);
    assert.ok(components.comp instanceof TestComponent);
    assert.ok(components.child1 instanceof TestComponent);
    assert.strictEqual(1, console.warn.callCount);
  });

  it('should separately return components that are not children of others', function() {
    var element = createComponentElement();

    var collector = new ComponentCollector(element);
    var creationData = {
      child1: {
        data: {id: 'child1'},
        componentName: 'TestComponent',
        ref: 'child1'
      },
      comp: {
        data: {
          children: '<div data-component id="child1"></div>',
          id: 'comp'
        },
        componentName: 'TestComponent'
      }
    };
    collector.extractComponents(creationData);

    var components = collector.getRootComponents();
    assert.strictEqual(1, Object.keys(components).length);
    assert.ok(components.comp instanceof TestComponent);
  });

  function createComponentElement(parent) {
    parent = parent || document.createElement('div');
    var element = document.createElement('div');
    element.setAttribute('data-component', true);
    element.setAttribute('id', 'comp');
    dom.append(parent, element);
    dom.append(document.body, parent);
    return element;
  }
});
