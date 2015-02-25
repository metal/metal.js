'use strict';

import {async} from '../../src/promise/Promise';
import ComponentRegistry from '../../src/component/ComponentRegistry';
import SoyComponent from '../../src/soy/SoyComponent';

var SoyTemplates = ComponentRegistry.Templates.SoyComponent;

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

  describe('Child Components', function() {
    beforeEach(function() {
      var ChildComponent = createCustomComponentClass();
      ComponentRegistry.register('ChildComponent', ChildComponent);
      ChildComponent.ATTRS = {
        bar: {
          value: ''
        }
      };

      var CustomComponent = createCustomComponentClass();
      CustomComponent.ATTRS = {
        count: {
          value: 1
        },
        foo: {
          value: 'bar'
        }
      };
      CustomComponent.SURFACES = {
        component: {
          renderAttrs: ['foo', 'count']
        }
      };
      CustomComponent.TEMPLATES = {
        element: function(data) {
          return {
            content: '<div id="' + data.id + '-component"></div>'
          };
        },
        component: function(data) {
          var result = {content: ''};
          for (var i = 0; i < data.count; i++) {
            var childData = {
              data: {bar: data.foo},
              name: 'ChildComponent',
              parentId: data.id,
              ref: 'myChild' + i
            };
            result.content += SoyTemplates.component(childData, null, {});
          }
          return result;
        }
      };

      this.ChildComponent = ChildComponent;
      this.CustomComponent = CustomComponent;
    });

    it('should instantiate rendered child component', function() {
      var custom = new this.CustomComponent();
      custom.render();

      var child = custom.components_.myChild0;
      assert.ok(child);
      assert.strictEqual(this.ChildComponent, child.constructor);
      assert.strictEqual('bar', child.bar);
      assert.ok(custom.element.querySelector('#' + child.id));
    });

    it('should update rendered child component', function(done) {
      var test = this;
      var custom = new this.CustomComponent();
      custom.render();

      custom.foo = 'bar2';
      custom.on('attrsChanged', function() {
        var child = custom.components_.myChild0;
        assert.ok(child);
        assert.strictEqual(test.ChildComponent, child.constructor);
        assert.strictEqual('bar2', child.bar);
        assert.ok(custom.element.querySelector('#' + child.id));

        done();
      });
    });

    it('should reuse previously rendered component instances', function(done) {
      var custom = new this.CustomComponent();
      custom.render();

      var prevChild = custom.components_.myChild0;
      custom.count = 2;
      custom.on('attrsChanged', function() {
        assert.strictEqual(prevChild, custom.components_.myChild0);
        assert.ok(custom.components_.myChild1);
        assert.notStrictEqual(prevChild, custom.components_.myChild1);
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

      assert.ok(!custom.components_.myChild0);
    });
  });

  function createCustomComponentClass() {
    class CustomComponent extends SoyComponent {
      constructor(opt_config) {
        super(opt_config);
      }
    }
    return CustomComponent;
  }
});
