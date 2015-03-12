'use strict';

import {async} from '../../src/promise/Promise';
import dom from '../../src/dom/dom';
import ComponentRegistry from '../../src/component/ComponentRegistry';
import SoyComponent from '../../src/soy/SoyComponent';

var SoyTemplates = ComponentRegistry.Templates.SoyComponent;
var placeholderTemplate = soy.$$getDelegateFn(soy.$$getDelTemplateId('ComponentChildren'));

describe('SoyComponent', function() {
  afterEach(function() {
    document.body.innerHTML = '';
  });

  it('should render element content automatically when template is defined', function() {
    var CustomComponent = createCustomComponentClass();
    CustomComponent.TEMPLATES = {
      element: function() {
        return {
          content: '<div class="myContent">Hello World</div>'
        };
      }
    };

    var custom = new CustomComponent();
    custom.render();

    assert.strictEqual(1, custom.element.children.length);
    assert.strictEqual('myContent', custom.element.children[0].className);
  });

  it('should create surfaces from element template', function() {
    var CustomComponent = createCustomComponentClass();
    CustomComponent.SURFACES = {
      header: {}
    };
    CustomComponent.TEMPLATES = {
      element: function(data) {
        return {
          content: '<div id="' + data.id + '-header">Header Surface</div>'
        };
      }
    };

    var custom = new CustomComponent();
    custom.render();

    assert.strictEqual('Header Surface', custom.getSurfaceElement('header').innerHTML);
  });

  it('should not throw error if element template is not defined', function() {
    var CustomComponent = createCustomComponentClass();
    var custom = new CustomComponent();

    assert.doesNotThrow(function() {
      custom.render();
    });
  });

  it('should render surface automatically from template', function(done) {
    var CustomComponent = createCustomComponentClass();
    CustomComponent.ATTRS = {
      headerContent: {
        value: 'Hello World'
      }
    };
    CustomComponent.SURFACES = {
      header: {
        renderAttrs: ['headerContent']
      }
    };
    CustomComponent.TEMPLATES = {
      element: function(data) {
        return {
          content: '<div id="' + data.id + '-header"></div>'
        };
      },
      header: function(data) {
        return {
          content: '<p>' + data.headerContent + '</p>'
        };
      }
    };

    var custom = new CustomComponent();
    custom.render();

    var surfaceElement = custom.getSurfaceElement('header');
    assert.strictEqual('<p>Hello World</p>', surfaceElement.innerHTML);

    custom.headerContent = 'Hello World 2';
    async.nextTick(function() {
      assert.strictEqual('<p>Hello World 2</p>', surfaceElement.innerHTML);
      done();
    });
  });

  describe('Surfaces', function() {
    it('should automatically create surfaces for a component\'s templates', function() {
      var ChildComponent = createCustomComponentClass('ChildComponent');
      ChildComponent.TEMPLATES = {
        header: function() {},
        footer: function() {}
      };

      var child = new ChildComponent();
      var surfaces = child.getSurfaces();
      assert.deepEqual(['header', 'footer'], Object.keys(surfaces));
    });

    it('should not create surface for element template', function() {
      var ChildComponent = createCustomComponentClass('ChildComponent');
      ChildComponent.TEMPLATES = {
        element: function() {},
        header: function() {}
      };

      var child = new ChildComponent();
      var surfaces = child.getSurfaces();
      assert.deepEqual(['header'], Object.keys(surfaces));
    });

    it('should set surface renderAttrs to its template params', function() {
      var ChildComponent = createCustomComponentClass('ChildComponent');
      ChildComponent.TEMPLATES = {
        element: function() {},
        header: function() {},
        footer: function() {}
      };
      ChildComponent.TEMPLATES.header.params = ['headerContent'];
      ChildComponent.TEMPLATES.footer.params = ['footerContent', 'footerToolbar'];

      var child = new ChildComponent();
      var surfaces = child.getSurfaces();
      assert.deepEqual(['headerContent'], surfaces.header.renderAttrs);
      assert.deepEqual(['footerContent', 'footerToolbar'], surfaces.footer.renderAttrs);
    });

    it('should not override surface config when it already exists', function() {
      var ChildComponent = createCustomComponentClass('ChildComponent');
      ChildComponent.TEMPLATES = {
        element: function() {},
        header: function() {}
      };
      ChildComponent.TEMPLATES.header.params = ['headerContent'];
      ChildComponent.SURFACES = {
        header: {
          renderAttrs: ['foo']
        }
      };

      var child = new ChildComponent();
      var surfaces = child.getSurfaces();
      assert.deepEqual(['foo'], surfaces.header.renderAttrs);
    });
  });

  describe('Nested Components', function() {
    beforeEach(function() {
      var ChildComponent = createCustomComponentClass('ChildComponent');
      ChildComponent.ATTRS = {
        bar: {
          value: ''
        }
      };
      ChildComponent.SURFACES = {
        children: {
          renderAttrs: ['bar']
        }
      };
      ChildComponent.TEMPLATES = {
        element: function(data) {
          return {
            content: '<div id="' + data.id + '-children"></div>'
          };
        },
        children: function(data) {
          return {
            content: data.bar + placeholderTemplate(data, null, {}).content
          };
        }
      };
      this.ChildComponent = ChildComponent;
    });

    it('should instantiate rendered child component', function() {
      var NestedComponent = createNestedComponentClass();
      var custom = new NestedComponent();
      custom.render();

      var child = custom.components.myChild0;
      assert.ok(child);
      assert.strictEqual(this.ChildComponent, child.constructor);
      assert.strictEqual('bar', child.bar);
      assert.ok(custom.element.querySelector('#' + child.id));
    });

    it('should update rendered child component', function(done) {
      var test = this;
      var NestedComponent = createNestedComponentClass();
      var custom = new NestedComponent();
      custom.render();

      custom.foo = 'bar2';
      custom.on('attrsChanged', function() {
        var child = custom.components.myChild0;
        assert.ok(child);
        assert.strictEqual(test.ChildComponent, child.constructor);
        assert.strictEqual('bar2', child.bar);
        assert.ok(custom.element.querySelector('#' + child.id));

        done();
      });
    });

    it('should reuse previously rendered component instances', function(done) {
      var NestedComponent = createNestedComponentClass();
      var custom = new NestedComponent();
      custom.render();

      var prevChild = custom.components.myChild0;
      custom.count = 2;
      custom.on('attrsChanged', function() {
        assert.strictEqual(prevChild, custom.components.myChild0);
        assert.ok(custom.components.myChild1);
        assert.notStrictEqual(prevChild, custom.components.myChild1);
        done();
      });
    });

    it('should ignore component elements that were not rendered via a SoyTemplate call', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.TEMPLATES = {
        element: function() {
          return {
            content: '<div data-ref="myChild0" data-component="ChildComponent"></div>'
          };
        }
      };

      var custom = new CustomComponent();
      custom.render();

      assert.ok(!custom.components.myChild0);
    });

    it('should pass children to nested components', function() {
      var MultipleNestedComponent = createMultipleNestedComponentClass();
      var component = new MultipleNestedComponent();
      component.render();

      var comps = component.components;
      assert.ok(comps.child1);
      assert.ok(comps.child2);
      assert.ok(comps.child3);
      assert.ok(comps.nested);

      assert.strictEqual(0, component.children.length);
      assert.strictEqual(2, comps.nested.children.length);
      assert.deepEqual([comps.child2, comps.child3], comps.nested.children);
      assert.strictEqual(0, comps.child1.children.length);
      assert.strictEqual(1, comps.child2.children.length);
      assert.deepEqual([comps.child1], comps.child2.children);
      assert.strictEqual(0, comps.child3.children.length);
    });

    it('should update nested components children', function(done) {
      var MultipleNestedComponent = createMultipleNestedComponentClass();
      var component = new MultipleNestedComponent();
      component.render();

      component.bar = 'foo';
      component.on('attrsChanged', function() {
        var comps = component.components;
        assert.strictEqual('foo', comps.child1.bar);
        assert.strictEqual('foo', comps.child2.bar);
        assert.strictEqual('foo', comps.child3.bar);
        assert.strictEqual('foo', comps.nested.bar);
        done();
      });
    });

    it('should render children components inside placeholder', function() {
      var MultipleNestedComponent = createMultipleNestedComponentClass();
      var component = new MultipleNestedComponent();
      component.render();

      var comps = component.components;
      var placeholder = document.getElementById(comps.nested.id + '-children-placeholder');
      assert.strictEqual(2, placeholder.childNodes.length);
      assert.strictEqual(comps.child2.element, placeholder.childNodes[0]);
      assert.strictEqual(comps.child3.element, placeholder.childNodes[1]);

      placeholder = document.getElementById(comps.child2.id + '-children-placeholder');
      assert.strictEqual(1, placeholder.childNodes.length);
      assert.strictEqual(comps.child1.element, placeholder.childNodes[0]);
    });

    it('should not render children components if no placeholder exists', function() {
      createCustomComponentClass('NoPlaceholderComponent');
      var MainComponent = createCustomComponentClass('MainComponent');
      MainComponent.TEMPLATES = {
        element: function() {
          var child = SoyTemplates.component({
            componentName: 'ChildComponent',
            ref: 'child'
          }, null, {});
          return SoyTemplates.component({
            children: child,
            componentName: 'NoPlaceholderComponent',
            ref: 'noPlaceholder'
          }, null, {});
        }
      };

      var component = new MainComponent();
      component.render();

      var comps = component.components;
      assert.ok(!comps.child.wasRendered);
    });

    it('should update dom when children changes', function(done) {
      var MultipleNestedComponent = createMultipleNestedComponentClass();
      var component = new MultipleNestedComponent();
      component.render();

      var comps = component.components;

      component.invert = true;
      comps.nested.on('attrsChanged', function() {
        var placeholder = document.getElementById(comps.nested.id + '-children-placeholder');
        assert.strictEqual(2, placeholder.childNodes.length);
        assert.strictEqual(comps.child3.element, placeholder.childNodes[0]);
        assert.strictEqual(comps.child2.element, placeholder.childNodes[1]);
        done();
      });
    });

    describe('Decorate Children', function() {
      it('should decorate children components if main component was decorated', function() {
        var content = '<div id="decorated-children-placeholder">' +
          '<div></div><div></div></div>';
        var element = document.createElement('div');
        dom.append(element, content);

        class DecoratedComponent extends SoyComponent {
          constructor(opt_config) {
            super(opt_config);
          }
        }
        var comp = new DecoratedComponent({
          children: [new DecoratedComponent(), new DecoratedComponent()],
          element: element,
          id: 'decorated'
        }).decorate();

        assert.ok(comp.children[0].wasDecorated);
        assert.ok(comp.children[1].wasDecorated);
      });
    });
  });

  function createCustomComponentClass(name) {
    class CustomComponent extends SoyComponent {
      constructor(opt_config) {
        super(opt_config);
      }
    }
    ComponentRegistry.register(name || 'CustomComponent', CustomComponent);
    return CustomComponent;
  }

  function createNestedComponentClass() {
    var NestedComponent = createCustomComponentClass('NestedComponent');
    NestedComponent.ATTRS = {
      count: {
        value: 1
      },
      foo: {
        value: 'bar'
      }
    };
    NestedComponent.SURFACES = {
      component: {
        renderAttrs: ['foo', 'count']
      }
    };
    NestedComponent.TEMPLATES = {
      element: function(data) {
        return {
          content: '<div id="' + data.id + '-component"></div>'
        };
      },
      component: function(data) {
        var result = {content: ''};
        for (var i = 0; i < data.count; i++) {
          var childData = {
            bar: data.foo,
            componentName: 'ChildComponent',
            ref: 'myChild' + i
          };
          result.content += SoyTemplates.component(childData, null, {});
        }
        return result;
      }
    };
    return NestedComponent;
  }

  function createMultipleNestedComponentClass() {
    var MultipleNestedComponent = createCustomComponentClass('MultipleNestedComponent');
    MultipleNestedComponent.ATTRS = {
      bar: {
        value: 'bar'
      },
      invert: {
        value: false
      }
    };
    MultipleNestedComponent.SURFACES = {
      children: {
        renderAttrs: ['bar', 'invert']
      }
    };
    MultipleNestedComponent.TEMPLATES = {
      element: function(data) {
        return {
          content: '<div id="' + data.id + '-children"></div>'
        };
      },
      children: function(data) {
        var child1 = SoyTemplates.component({
          bar: data.bar,
          componentName: 'ChildComponent',
          ref: 'child1'
        }, null, {});
        var child2 = SoyTemplates.component({
          bar: data.bar,
          children: child1,
          componentName: 'ChildComponent',
          ref: 'child2'
        }, null, {});
        var child3 = SoyTemplates.component({
          bar: data.bar,
          componentName: 'ChildComponent',
          ref: 'child3'
        }, null, {});
        var nested = SoyTemplates.component({
          bar: data.bar,
          children: sanitizeHtml(data.invert ? child3.content + child2.content : child2.content + child3.content),
          componentName: 'ChildComponent',
          ref: 'nested'
        }, null, {});

        return nested;
      }
    };
    return MultipleNestedComponent;
  }

  function sanitizeHtml(content) {
    return soydata.VERY_UNSAFE.ordainSanitizedHtml(content);
  }
});
