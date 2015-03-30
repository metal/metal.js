'use strict';

import dom from '../../src/dom/dom';
import ComponentCollector from '../../src/component/ComponentCollector';
import ComponentRegistry from '../../src/component/ComponentRegistry';
import SoyComponent from '../../src/soy/SoyComponent';

import './assets/DeeplyNestedTestComponent.soy';
import './assets/ChildrenTestComponent.soy';
import './assets/CustomTestComponent.soy';
import './assets/EventsTestComponent.soy';
import './assets/NestedTestComponent.soy';

describe('SoyComponent', function() {
  beforeEach(function() {
    document.body.innerHTML = '';
  });

  it('should render element content with surfaces automatically from template', function() {
    var CustomTestComponent = createCustomTestComponentClass();
    CustomTestComponent.ATTRS = {
      footerContent: {},
      headerContent: {}
    };

    var custom = new CustomTestComponent({
      footerContent: 'My Footer',
      headerContent: 'My Header'
    });
    custom.render();

    assert.strictEqual(2, custom.element.childNodes.length);
    assert.strictEqual(custom.getSurfaceElement('header'), custom.element.childNodes[0]);
    assert.strictEqual('My Header', custom.element.childNodes[0].innerHTML);
    assert.strictEqual(custom.getSurfaceElement('footer'), custom.element.childNodes[1]);
    assert.strictEqual('My Footer', custom.element.childNodes[1].innerHTML);
  });

  it('should render element tag according to its template when defined', function() {
    var CustomTestComponent = createCustomTestComponentClass();

    var custom = new CustomTestComponent();
    custom.render();
    assert.strictEqual('CUSTOM', custom.element.tagName);
  });

  it('should not throw error if element template is not defined', function() {
    var NoTemplateTestComponent = createCustomTestComponentClass('NoTemplateTestComponent');
    var custom = new NoTemplateTestComponent();

    assert.doesNotThrow(function() {
      custom.render();
    });
  });

  it('should not throw error if surface template is not defined', function() {
    var CustomTestComponent = createCustomTestComponentClass();
    CustomTestComponent.ATTRS = {body: {}};
    CustomTestComponent.SURFACES = {body: {renderAttrs: ['body']}};

    var custom = new CustomTestComponent();

    assert.doesNotThrow(function() {
      custom.decorate();
    });
  });

  describe('Surfaces', function() {
    it('should automatically create surfaces for a component\'s templates', function() {
      var CustomTestComponent = createCustomTestComponentClass();

      var custom = new CustomTestComponent();
      var surfaces = custom.getSurfaces();
      assert.deepEqual(['header', 'footer'], Object.keys(surfaces));
    });

    it('should set surface renderAttrs to its template params', function() {
      var CustomTestComponent = createCustomTestComponentClass();

      var custom = new CustomTestComponent();
      var surfaces = custom.getSurfaces();
      assert.deepEqual(['headerContent'], surfaces.header.renderAttrs);
      assert.deepEqual(['footerContent'], surfaces.footer.renderAttrs);
    });

    it('should not override surface config when it already exists', function() {
      var CustomTestComponent = createCustomTestComponentClass();
      CustomTestComponent.SURFACES = {
        header: {
          renderAttrs: ['foo']
        }
      };

      var custom = new CustomTestComponent();
      var surfaces = custom.getSurfaces();
      assert.deepEqual(['foo'], surfaces.header.renderAttrs);
    });
  });

  describe('Inline Events', function() {
    it('should attach listeners from element template', function() {
      var EventsTestComponent = createCustomTestComponentClass('EventsTestComponent');
      EventsTestComponent.ATTRS = {footerButtons: {}};
      EventsTestComponent.prototype.handleClick = sinon.stub();
      EventsTestComponent.prototype.handleMouseDown = sinon.stub();
      EventsTestComponent.prototype.handleMouseOver = sinon.stub();

      var custom = new EventsTestComponent({footerButtons: [{label: 'Ok'}]}).render();
      dom.triggerEvent(custom.element.querySelector('.content'), 'click');
      assert.strictEqual(1, custom.handleClick.callCount);
    });

    it('should attach listeners from surface template', function() {
      var EventsTestComponent = createCustomTestComponentClass('EventsTestComponent');
      EventsTestComponent.ATTRS = {footerButtons: {}};
      EventsTestComponent.prototype.handleClick = sinon.stub();
      EventsTestComponent.prototype.handleMouseDown = sinon.stub();
      EventsTestComponent.prototype.handleMouseOver = sinon.stub();

      var custom = new EventsTestComponent({footerButtons: [{label: 'Ok'}]}).render();
      dom.triggerEvent(custom.element.querySelector('button'), 'click');
      assert.strictEqual(1, custom.handleClick.callCount);
      dom.triggerEvent(custom.element.querySelector('button'), 'mouseover');
      assert.strictEqual(1, custom.handleMouseOver.callCount);
    });

    it('should detach unused listeners after surface update', function(done) {
      var EventsTestComponent = createCustomTestComponentClass('EventsTestComponent');
      EventsTestComponent.ATTRS = {footerButtons: {}};
      EventsTestComponent.prototype.handleClick = sinon.stub();
      EventsTestComponent.prototype.handleMouseDown = sinon.stub();
      EventsTestComponent.prototype.handleMouseOver = sinon.stub();

      var custom = new EventsTestComponent({footerButtons: [{label: 'Ok'}]}).render();
      sinon.spy(custom.element, 'removeEventListener');

      custom.footerButtons = [];
      custom.on('attrsChanged', function() {
        assert.strictEqual(1, custom.element.removeEventListener.callCount);
        assert.strictEqual('mouseover', custom.element.removeEventListener.args[0][0]);
        done();
      });
    });

    it('should not detach listeners that are still useful after surface update', function(done) {
      var EventsTestComponent = createCustomTestComponentClass('EventsTestComponent');
      EventsTestComponent.ATTRS = {footerButtons: {}};
      EventsTestComponent.prototype.handleClick = sinon.stub();
      EventsTestComponent.prototype.handleMouseDown = sinon.stub();
      EventsTestComponent.prototype.handleMouseOver = sinon.stub();

      var custom = new EventsTestComponent({footerButtons: [{label: 'Ok'}]}).render();
      sinon.spy(custom.element, 'removeEventListener');

      custom.footerButtons = [{label: 'Ok'}, {label: 'Cancel'}];
      custom.on('attrsChanged', function() {
        assert.strictEqual(0, custom.element.removeEventListener.callCount);
        done();
      });
    });

    it('should detach all listeners when element is detached', function() {
      var EventsTestComponent = createCustomTestComponentClass('EventsTestComponent');
      EventsTestComponent.ATTRS = {footerButtons: {}};
      EventsTestComponent.prototype.handleClick = sinon.stub();
      EventsTestComponent.prototype.handleMouseDown = sinon.stub();
      EventsTestComponent.prototype.handleMouseOver = sinon.stub();

      var custom = new EventsTestComponent({footerButtons: [{label: 'Ok'}]}).render();
      custom.detach();
      dom.append(document.body, custom.element);

      dom.triggerEvent(custom.element.querySelector('.content'), 'click');
      dom.triggerEvent(custom.element.querySelector('button'), 'click');
      dom.triggerEvent(custom.element.querySelector('button'), 'mouseover');
      assert.strictEqual(0, custom.handleClick.callCount);
    });
  });

  describe('Nested Components', function() {
    beforeEach(function() {
      ComponentRegistry.components_ = {};
      ComponentCollector.components = {};

      var ChildrenTestComponent = createCustomTestComponentClass('ChildrenTestComponent');
      ChildrenTestComponent.ATTRS = {bar: {value: ''}};
      this.ChildrenTestComponent = ChildrenTestComponent;

      var EventsTestComponent = createCustomTestComponentClass('EventsTestComponent');
      EventsTestComponent.ATTRS = {footerButtons: {value: []}};
      EventsTestComponent.prototype.handleClick = sinon.stub();
      EventsTestComponent.prototype.handleMouseDown = sinon.stub();
      EventsTestComponent.prototype.handleMouseOver = sinon.stub();
    });

    it('should instantiate rendered child component', function() {
      var NestedTestComponent = createNestedTestComponentClass();
      var custom = new NestedTestComponent({id: 'nested'}).render();

      var child = custom.components.nestedMyChild0;
      assert.ok(child);
      assert.strictEqual(this.ChildrenTestComponent, child.constructor);
      assert.strictEqual('bar', child.bar);
    });

    it('should render nested component inside parent', function() {
      var NestedTestComponent = createNestedTestComponentClass();
      var custom = new NestedTestComponent({id: 'nested'}).render();

      var childPlaceholder = custom.element.querySelector('#nestedMyChild0');
      var child = custom.components.nestedMyChild0;

      assert.strictEqual(childPlaceholder, child.element);
      assert.strictEqual(1, childPlaceholder.childNodes.length);
    });

    it('should replace placeholder with child component\'s element if it\'s already defined', function() {
      this.ChildrenTestComponent.prototype.created = function() {
        dom.addClasses(this.element, ['myClass']);
      };
      var NestedTestComponent = createNestedTestComponentClass();
      var custom = new NestedTestComponent({id: 'nested'}).render();

      var childPlaceholder = custom.element.querySelector('#nestedMyChild0');
      var child = custom.components.nestedMyChild0;
      assert.ok(child);
      assert.strictEqual(this.ChildrenTestComponent, child.constructor);
      assert.strictEqual('bar', child.bar);
      assert.strictEqual(childPlaceholder, child.element);
      assert.strictEqual(1, childPlaceholder.childNodes.length);
      assert.ok(dom.hasClass(child.element, 'myClass'));
    });

    it('should update rendered child component', function(done) {
      var test = this;
      var NestedTestComponent = createNestedTestComponentClass();
      var custom = new NestedTestComponent({id: 'nested'}).render();

      custom.foo = 'bar2';
      custom.on('attrsChanged', function() {
        var child = custom.components.nestedMyChild0;
        assert.ok(child);
        assert.strictEqual(test.ChildrenTestComponent, child.constructor);
        assert.strictEqual('bar2', child.bar);
        assert.ok(custom.element.querySelector('#' + child.id));

        done();
      });
    });

    it('should not rerender own surface if only nested component contents changed', function(done) {
      var test = this;
      var NestedTestComponent = createNestedTestComponentClass();
      var custom = new NestedTestComponent({id: 'nested'}).render();

      custom.foo = 'bar2';
      custom.on('attrsChanged', function() {
        assert.ok(!custom.getSurface('components').cacheMiss);
        done();
      });
    });

    it('should reuse previously rendered component instances', function(done) {
      var NestedTestComponent = createNestedTestComponentClass();
      var custom = new NestedTestComponent({id: 'nested'}).render();

      var prevChild = custom.components.nestedMyChild0;
      custom.count = 2;
      custom.on('attrsChanged', function() {
        assert.strictEqual(prevChild, custom.components.nestedMyChild0);
        assert.ok(custom.components.nestedMyChild1);
        assert.notStrictEqual(prevChild, custom.components.nestedMyChild1);
        done();
      });
    });

    it('should reposition previously rendered component instances', function(done) {
      var NestedTestComponent = createNestedTestComponentClass();
      var custom = new NestedTestComponent({count: 2, id: 'nested'}).render();
      var comps = custom.components;

      var childElements = custom.element.querySelectorAll('[data-component]');
      assert.strictEqual(childElements[0], comps.nestedMyChild0.element);
      assert.strictEqual(childElements[1], comps.nestedMyChild1.element);

      custom.invert = true;
      custom.on('attrsChanged', function() {
        childElements = custom.element.querySelectorAll('[data-component]');
        assert.strictEqual(childElements[0], comps.nestedMyChild1.element);
        assert.strictEqual(childElements[1], comps.nestedMyChild0.element);
        done();
      });
    });

    it('should not update rendered child component when reattaching', function() {
      var NestedTestComponent = createNestedTestComponentClass();
      var custom = new NestedTestComponent({id: 'nested'}).render();

      var child = custom.components.nestedMyChild0;
      sinon.spy(child, 'setAttrs');
      custom.detach();
      custom.attach();
      assert.strictEqual(0, child.setAttrs.callCount);
    });

    it('should render nested component correctly when element is not on document', function() {
      var element = document.createElement('div');
      var NestedTestComponent = createNestedTestComponentClass();
      var custom = new NestedTestComponent({id: 'nested'}).render(element);

      var child = custom.components.nestedMyChild0;
      assert.ok(child);
      assert.strictEqual(this.ChildrenTestComponent, child.constructor);
      assert.strictEqual('bar', child.bar);
      assert.ok(custom.element.querySelector('#' + child.id));
    });

    it('should pass attribute with components to nested components', function() {
      this.ChildrenTestComponent.ATTRS.moreComponents = {isComponentsArray: true};

      var ComponentAttrTestComponent = createCustomTestComponentClass('ComponentAttrTestComponent');
      var component = new ComponentAttrTestComponent({id: 'nested'}).render();

      var comps = component.components;
      assert.ok(comps.nestedChild);
      assert.ok(comps.nestedMore);

      assert.deepEqual([comps.nestedMore], comps.nestedChild.moreComponents);
    });

    it('should pass children to nested components', function() {
      var DeeplyNestedTestComponent = createDeeplyNestedTestComponentClass();
      var component = new DeeplyNestedTestComponent({id: 'nested'}).render();

      var comps = component.components;
      assert.ok(comps['nested-child1']);
      assert.ok(comps['nested-child2']);
      assert.ok(comps['nested-child3']);
      assert.ok(comps['nested-main']);

      assert.strictEqual(0, component.children.length);
      assert.strictEqual(2, comps['nested-main'].children.length);
      assert.deepEqual([comps['nested-child2'], comps['nested-child3']], comps['nested-main'].children);
      assert.strictEqual(0, comps['nested-child1'].children.length);
      assert.strictEqual(1, comps['nested-child2'].children.length);
      assert.deepEqual([comps['nested-child1']], comps['nested-child2'].children);
      assert.strictEqual(0, comps['nested-child3'].children.length);
    });

    it('should update nested components children', function(done) {
      var DeeplyNestedTestComponent = createDeeplyNestedTestComponentClass();
      var component = new DeeplyNestedTestComponent({id: 'nested'}).render();

      component.bar = 'foo';
      component.on('attrsChanged', function() {
        var comps = component.components;
        assert.strictEqual('foo', comps['nested-child2'].bar);
        assert.strictEqual('foo', comps['nested-main'].bar);
        done();
      });
    });

    it('should render children components passed from template inside placeholder', function() {
      var DeeplyNestedTestComponent = createDeeplyNestedTestComponentClass();
      var component = new DeeplyNestedTestComponent({id: 'nested'}).render();

      var comps = component.components;
      var placeholder = document.getElementById(comps['nested-main'].id + '-children-placeholder');
      assert.strictEqual(2, placeholder.childNodes.length);
      assert.strictEqual(comps['nested-child2'].element, placeholder.childNodes[0]);
      assert.strictEqual(comps['nested-child3'].element, placeholder.childNodes[1]);

      placeholder = document.getElementById(comps['nested-child2'].id + '-children-placeholder');
      assert.strictEqual(1, placeholder.childNodes.length);
      assert.strictEqual(comps['nested-child1'].element, placeholder.childNodes[0]);
    });

    it('should reposition children when they are moved by template call', function(done) {
      var DeeplyNestedTestComponent = createDeeplyNestedTestComponentClass();
      var component = new DeeplyNestedTestComponent({id: 'nested'}).render();

      var comps = component.components;

      component.invert = true;
      component.once('attrsChanged', function() {
        comps['nested-main'].once('attrsChanged', function() {
          var placeholder = document.getElementById(comps['nested-main'].id + '-children-placeholder');
          assert.strictEqual(2, placeholder.childNodes.length);
          assert.strictEqual(comps['nested-child3'].element, placeholder.childNodes[0]);
          assert.strictEqual(comps['nested-child2'].element, placeholder.childNodes[1]);
          done();
        });
      });
    });

    it('should attach listeners on nested components from template', function() {
      var DeeplyNestedTestComponent = createDeeplyNestedTestComponentClass();
      var component = new DeeplyNestedTestComponent({id: 'nested'}).render();

      var child3 = component.components['nested-child3'];
      dom.triggerEvent(child3.element.querySelector('.content'), 'click');
      assert.strictEqual(0, component.handleClick.callCount);
      assert.strictEqual(1, child3.handleClick.callCount);

      dom.triggerEvent(child3.element.querySelector('.content'), 'mousedown');
      assert.strictEqual(0, component.handleMouseDown.callCount);
      assert.strictEqual(1, child3.handleMouseDown.callCount);

      dom.triggerEvent(child3.element.querySelector('button'), 'click');
      assert.strictEqual(0, component.handleClick.callCount);
      assert.strictEqual(2, child3.handleClick.callCount);

      dom.triggerEvent(child3.element.querySelector('button'), 'mouseover');
      assert.strictEqual(0, component.handleMouseOver.callCount);
      assert.strictEqual(1, child3.handleMouseOver.callCount);
    });

    it('should attach listeners on nested components after parent surface update', function(done) {
      var DeeplyNestedTestComponent = createDeeplyNestedTestComponentClass();
      DeeplyNestedTestComponent.prototype.handleClick = sinon.stub();
      DeeplyNestedTestComponent.prototype.handleMouseDown = sinon.stub();
      DeeplyNestedTestComponent.prototype.handleMouseOver = sinon.stub();
      var component = new DeeplyNestedTestComponent({id: 'nested'}).render();

      component.invert = true;
      component.once('attrsChanged', function() {
        var child3 = component.components['nested-child3'];
        dom.triggerEvent(child3.element.querySelector('.content'), 'click');
        assert.strictEqual(1, child3.handleClick.callCount);

        assert.strictEqual(0, component.handleClick.callCount);
        done();
      });
    });

    it('should detach unused listeners from nested components', function(done) {
      var DeeplyNestedTestComponent = createDeeplyNestedTestComponentClass();
      var component = new DeeplyNestedTestComponent({id: 'nested'}).render();

      var child3 = component.components['nested-child3'];
      sinon.spy(child3.element, 'removeEventListener');

      component.footerButtons = [];
      component.once('attrsChanged', function() {
        child3.once('attrsChanged', function() {
          assert.strictEqual(1, child3.element.removeEventListener.callCount);
          assert.strictEqual('mouseover', child3.element.removeEventListener.args[0][0]);
          done();
        });
      });
    });

    it('should store nested component references on creator component', function() {
      var DeeplyNestedTestComponent = createDeeplyNestedTestComponentClass();
      var component = new DeeplyNestedTestComponent({id: 'nested'}).render();

      assert.strictEqual(4, Object.keys(component.components).length);

      var child1 = component.components['nested-child1'];
      assert.strictEqual(1, Object.keys(child1.components).length);
      assert.strictEqual('nested-child1MyChild0', Object.keys(child1.components)[0]);
    });

    it('should render received children components inside placeholder', function() {
      var child = new this.ChildrenTestComponent();
      var component = new this.ChildrenTestComponent({children: [child]}).render();

      var placeholder = document.getElementById(component.id + '-children-placeholder');
      assert.strictEqual(1, placeholder.childNodes.length);
      assert.strictEqual(child.element, placeholder.childNodes[0]);
    });

    it('should not update placeholder if children don\'t change', function(done) {
      var child = new this.ChildrenTestComponent();
      var component = new this.ChildrenTestComponent({children: [child]}).render();

      component.children = [child];
      component.on('attrsChanged', function() {
        var placeholder = document.getElementById(component.id + '-children-placeholder');
        assert.strictEqual(1, placeholder.childNodes.length);
        assert.strictEqual(child.element, placeholder.childNodes[0]);
        done();
      });
    });

    it('should not render received children components if no placeholder exists', function() {
      var NoPlaceholderComponent = createCustomTestComponentClass('NoPlaceholderComponent');
      var component = new NoPlaceholderComponent({
        children: [new this.ChildrenTestComponent()]
      });
      component.render();

      assert.ok(!component.children[0].wasRendered);
    });

    it('should instantiate nested components when main component is decorated', function() {
      var content = '<div id="nested-components" >' +
        '<div id="nestedMyChild0" class="childrentestcomponent component" data-component="">' +
        '<div id="nestedMyChild0-children">bar' +
        '<div id="nestedMyChild0-children-placeholder" data-component-children=""></div>' +
        '</div>' +
        '</div>' +
        '</div>';
      var element = document.createElement('div');
      element.id = 'nested';
      dom.append(element, content);

      var NestedTestComponent = createNestedTestComponentClass();
      var component = new NestedTestComponent({element: element}).decorate();

      var comps = component.components;
      assert.ok(comps.nestedMyChild0.wasRendered);
      assert.ok(component.element.querySelector('#nestedMyChild0'));
    });

    it('should not need to update nested components when main component is decorated', function() {
      var content = '<div id="nested-components" >' +
        '<div id="nestedMyChild0" class="childrentestcomponent component" data-component="">' +
        '<div id="nestedMyChild0-children">bar' +
        '<div id="nestedMyChild0-children-placeholder" data-component-children=""></div>' +
        '</div>' +
        '</div>' +
        '</div>';
      var element = document.createElement('div');
      element.id = 'nested';
      dom.append(element, content);

      sinon.spy(this.ChildrenTestComponent.prototype, 'setAttrs');
      var NestedTestComponent = createNestedTestComponentClass();
      var component = new NestedTestComponent({element: element}).decorate();
      assert.strictEqual(0, component.components.nestedMyChild0.setAttrs.callCount);
    });

    it('should not need to update surfaces when main component is decorated', function() {
      var content = '<div id="nested-components" >' +
        '<div id="nestedMyChild0" class="childrentestcomponent component" data-component="">' +
        '<div id="nestedMyChild0-children">bar' +
        '<div id="nestedMyChild0-children-placeholder" data-component-children=""></div>' +
        '</div>' +
        '</div>' +
        '</div>';

      var element = document.createElement('div');
      element.id = 'nested';
      dom.append(element, content);

      var NestedTestComponent = createNestedTestComponentClass();
      var component = new NestedTestComponent({element: element}).decorate();
      assert.ok(!component.getSurface('components').cacheMiss);
    });
  });

  function createCustomTestComponentClass(name) {
    name = name || 'CustomTestComponent';
    class CustomTestComponent extends SoyComponent {
      constructor(opt_config) {
        super(opt_config);
      }
    }
    ComponentRegistry.register(name, CustomTestComponent);
    return CustomTestComponent;
  }

  function createNestedTestComponentClass() {
    var NestedTestComponent = createCustomTestComponentClass('NestedTestComponent');
    NestedTestComponent.ATTRS = {
      count: {
        value: 1
      },
      foo: {
        value: 'bar'
      },
      invert: {
        value: false
      }
    };
    return NestedTestComponent;
  }

  function createDeeplyNestedTestComponentClass() {
    createNestedTestComponentClass();
    var DeeplyNestedTestComponent = createCustomTestComponentClass('DeeplyNestedTestComponent');
    DeeplyNestedTestComponent.prototype.handleClick = sinon.stub();
    DeeplyNestedTestComponent.prototype.handleMouseDown = sinon.stub();
    DeeplyNestedTestComponent.prototype.handleMouseOver = sinon.stub();
    DeeplyNestedTestComponent.ATTRS = {
      bar: {
        value: 'bar'
      },
      footerButtons: {
        value: [{label: 'Ok'}]
      },
      invert: {
        value: false
      }
    };
    return DeeplyNestedTestComponent;
  }
});
