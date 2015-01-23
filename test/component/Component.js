'use strict';

var assert = require('assert');
var jsdom = require('mocha-jsdom');
var sinon = require('sinon');
require('../fixture/sandbox.js');

describe('Component', function() {

  jsdom();

  beforeEach(function() {
    Element.prototype.classList = {
      add: sinon.stub(),
      remove: sinon.stub()
    };
  });

  describe('Lifecycle', function() {
    it('should test component render lifecycle', function() {
      var CustomComponent = createCustomComponentClass();

      CustomComponent.SURFACES = {
        header: {},
        bottom: {}
      };

      var custom = new CustomComponent();
      custom.render();

      sinon.assert.callOrder(
        CustomComponent.prototype.created,
        CustomComponent.prototype.renderInternal,
        CustomComponent.prototype.getSurfaceContent,
        CustomComponent.prototype.attached
      );

      sinon.assert.callCount(CustomComponent.prototype.created, 1);
      sinon.assert.callCount(CustomComponent.prototype.renderInternal, 1);
      sinon.assert.callCount(CustomComponent.prototype.attached, 1);

      sinon.assert.callCount(CustomComponent.prototype.getSurfaceContent, 2);
      assert.strictEqual('header', CustomComponent.prototype.getSurfaceContent.args[0][0]);
      assert.strictEqual('bottom', CustomComponent.prototype.getSurfaceContent.args[1][0]);

      sinon.assert.notCalled(CustomComponent.prototype.decorateInternal);
      sinon.assert.notCalled(CustomComponent.prototype.detached);
    });

    it('should test component decorate lifecycle', function() {
      var CustomComponent = createCustomComponentClass();

      CustomComponent.SURFACES = {
        header: {},
        bottom: {}
      };

      var custom = new CustomComponent();
      custom.decorate();

      sinon.assert.callOrder(
        CustomComponent.prototype.created,
        CustomComponent.prototype.decorateInternal,
        CustomComponent.prototype.getSurfaceContent,
        CustomComponent.prototype.attached);

      sinon.assert.callCount(CustomComponent.prototype.created, 1);
      sinon.assert.callCount(CustomComponent.prototype.decorateInternal, 1);
      sinon.assert.callCount(CustomComponent.prototype.attached, 1);

      sinon.assert.callCount(CustomComponent.prototype.getSurfaceContent, 2);
      assert.strictEqual('header', CustomComponent.prototype.getSurfaceContent.args[0][0]);
      assert.strictEqual('bottom', CustomComponent.prototype.getSurfaceContent.args[1][0]);

      sinon.assert.notCalled(CustomComponent.prototype.renderInternal);
      sinon.assert.notCalled(CustomComponent.prototype.detached);
    });

    it('should be able to manually invoke detach/attach lifecycle', function() {
      var CustomComponent = createCustomComponentClass();
      var custom = new CustomComponent();
      custom.render();
      sinon.assert.callCount(CustomComponent.prototype.attached, 1);

      custom.detach();
      assert.strictEqual(null, document.getElementById(custom.id));
      assert.strictEqual(false, custom.inDocument);
      sinon.assert.callCount(CustomComponent.prototype.detached, 1);

      custom.attach();
      assert.notStrictEqual(null, document.getElementById(custom.id));
      assert.strictEqual(true, custom.inDocument);
      sinon.assert.callCount(CustomComponent.prototype.attached, 2);
    });

    it('should throw error when component renders and it was already rendered', function() {
      var CustomComponent = createCustomComponentClass();
      var custom = new CustomComponent();
      custom.render();
      assert.throws(function() {
        custom.render();
      }, Error);
      sinon.assert.callCount(CustomComponent.prototype.renderInternal, 1);
      sinon.assert.callCount(CustomComponent.prototype.attached, 1);
    });

    it('should throw error when component decorates and it was already decorated', function() {
      var CustomComponent = createCustomComponentClass();
      var custom = new CustomComponent();
      custom.decorate();
      assert.throws(function() {
        custom.decorate();
      }, Error);
      sinon.assert.callCount(CustomComponent.prototype.decorateInternal, 1);
      sinon.assert.callCount(CustomComponent.prototype.attached, 1);
    });

    it('should overwrite component element tagName', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.ELEMENT_TAG_NAME = 'span';

      var custom = new CustomComponent();
      custom.render();
      assert.strictEqual('span', custom.element.tagName.toLowerCase());
    });

    it('should dispose component', function() {
      var CustomComponent = createCustomComponentClass();
      var custom = new CustomComponent();
      custom.render();

      var customId = custom.id;
      assert.notStrictEqual(null, document.getElementById(customId));
      custom.dispose();
      assert.strictEqual(null, document.getElementById(customId));

      sinon.assert.callCount(CustomComponent.prototype.detached, 1);
    });
  });

  describe('Attributes', function() {
    it('should set component id attr', function() {
      var CustomComponent = createCustomComponentClass();

      var custom = new CustomComponent({
        id: 'customId'
      });
      custom.render();
      assert.strictEqual('customId', custom.id);
    });

    it('should set component element attr', function() {
      var CustomComponent = createCustomComponentClass();

      var element = document.createElement('div');
      element.id = 'elementId';
      document.body.appendChild(element);

      var custom = new CustomComponent({
        element: element
      });
      custom.render();
      assert.strictEqual('elementId', custom.id);
      assert.strictEqual(element, custom.element);
    });

    it('should set component element id from id attr', function() {
      var CustomComponent = createCustomComponentClass();

      var element = document.createElement('div');
      element.id = 'elementId';
      document.body.appendChild(element);

      var custom = new CustomComponent({
        element: element,
        id: 'customId'
      });
      custom.render();
      assert.strictEqual('customId', element.id);
      assert.strictEqual(element, custom.element);
    });

    it('should set component elementClasses attr', function() {
      var CustomComponent = createCustomComponentClass();

      var custom = new CustomComponent({
        elementClasses: ['foo', 'bar']
      });
      custom.render();
      assert.deepEqual(['component', 'foo', 'bar'], Element.prototype.classList.add.args[0]);
    });

    it('should overwrite default component elementClasses from static hint', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.ELEMENT_CLASSES = ['overwritten'];

      var custom = new CustomComponent();
      custom.render();
      assert.strictEqual('overwritten', Element.prototype.classList.add.args[0][0]);
    });

    it('should fire synchronize attr synchronously on render and asynchronously when attr value change', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.ATTRS = {
        foo: {
          value: 0
        }
      };
      CustomComponent.ATTRS_SYNC = ['foo', 'unknown'];
      CustomComponent.prototype.syncFoo = sinon.spy();

      var custom = new CustomComponent({
        foo: 10
      });
      sinon.assert.notCalled(CustomComponent.prototype.syncFoo);
      custom.render();
      sinon.assert.callCount(CustomComponent.prototype.syncFoo, 1);
      assert.strictEqual(10, CustomComponent.prototype.syncFoo.args[0][0]);

      custom.foo = 20;
      sinon.assert.callCount(CustomComponent.prototype.syncFoo, 1);
      lfr.async.nextTick(function() {
        sinon.assert.callCount(CustomComponent.prototype.syncFoo, 2);
        assert.strictEqual(20, CustomComponent.prototype.syncFoo.args[1][0]);
      });
    });
  });

  describe('Surfaces', function() {
    it('should aggregate surfaces from hierarchy static hint', function() {
      var ParentComponent = createCustomComponentClass();
      ParentComponent.SURFACES = {
        header: {},
        bottom: {}
      };

      function ChildComponent(opt_config) {
        ChildComponent.base(this, 'constructor', opt_config);
      }
      lfr.inherits(ChildComponent, ParentComponent);
      ChildComponent.SURFACES = {
        content: {}
      };

      var child = new ChildComponent();
      assert.deepEqual(['header', 'bottom', 'content'], Object.keys(child.surfaces));

      // Adds test coverage for skipping surfaces aggregation
      new ChildComponent();
    });

    it('should dynamically add surfaces', function() {
      var CustomComponent = createCustomComponentClass();
      var custom = new CustomComponent();
      var headerSurfaceConfig = {};
      custom.addSurface('header', headerSurfaceConfig);
      custom.addSurface('bottom');
      assert.strictEqual(headerSurfaceConfig, custom.getSurface('header'));
      assert.deepEqual(['header', 'bottom'], Object.keys(custom.surfaces));
      assert.strictEqual(null, custom.getSurface('unknown'));
    });

    it('should overwrite surface element tagName', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.SURFACE_TAG_NAME = 'span';

      var custom = new CustomComponent();
      custom.addSurface('header');
      custom.render();
      assert.strictEqual('span', custom.getSurfaceElement('header').tagName.toLowerCase());
    });

    it('should query from component element dom or create surface element when requested', function() {
      var CustomComponent = createCustomComponentClass();

      var element = document.createElement('div');
      element.id = 'custom';
      var surface = document.createElement('div');
      surface.id = 'custom-header';
      element.appendChild(surface);
      document.body.appendChild(element);

      var custom = new CustomComponent({
        element: element
      });
      CustomComponent.prototype.renderInternal = function() {
        // Creates surface element and appends to component element
        this.element.appendChild(this.getSurfaceElement('bottom'));
      };
      custom.addSurface('header');
      custom.addSurface('bottom');
      custom.render();
      assert.strictEqual(document.getElementById('custom-header'), custom.getSurfaceElement('header'));
      assert.strictEqual(document.getElementById('custom-bottom'), custom.getSurfaceElement('bottom'));
    });

    it('should return null when element is requested for unknown surface', function() {
      var CustomComponent = createCustomComponentClass();
      var custom = new CustomComponent();
      custom.render();
      assert.strictEqual(null, custom.getSurfaceElement('unknown'));
    });

    it('should remove surface and its element from dom', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.prototype.renderInternal = function() {
        // Creates surface element and appends to component element
        this.element.appendChild(this.getSurfaceElement('header'));
      };
      var custom = new CustomComponent({
        id: 'custom'
      });
      custom.addSurface('header');
      custom.render();
      custom.removeSurface('header');
      assert.strictEqual(null, custom.getSurface('header'));
      assert.strictEqual(null, custom.getSurfaceElement('header'));
      assert.strictEqual(null, document.getElementById('custom-header'));
      assert.doesNotThrow(function() {
        custom.removeSurface('header');
      });
    });

    it('should render surface content', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.prototype.renderInternal = function() {
        this.element.appendChild(this.getSurfaceElement('header'));
        this.element.appendChild(this.getSurfaceElement('bottom'));
      };
      CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
        switch (surfaceId) {
          case 'header':
            return '<b>header</b>';
          case 'bottom':
            return '<span>bottom</span>';
        }
      };
      var custom = new CustomComponent();
      custom.addSurface('header');
      custom.addSurface('bottom');
      custom.render();
      assert.strictEqual('<b>header</b>', custom.getSurfaceElement('header').innerHTML);
      assert.strictEqual('<span>bottom</span>', custom.getSurfaceElement('bottom').innerHTML);
    });

    it('should render surface content when surface render attrs changes', function(done) {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.prototype.renderInternal = function() {
        this.element.appendChild(this.getSurfaceElement('header'));
        this.element.appendChild(this.getSurfaceElement('bottom'));
      };
      CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
        switch (surfaceId) {
          case 'header':
            return '<b style="font-size:' + this.fontSize + ';">' + this.headerContent + '</b>';
          case 'bottom':
            return '<span style="font-size:' + this.fontSize + ';">' + this.bottomContent + '</span>';
        }
      };
      var custom = new CustomComponent();
      custom.addAttrs({
        headerContent: {
          value: 'header'
        },
        bottomContent: {
          value: 'bottom'
        },
        fontSize: {
          value: '10px'
        }
      });
      custom.addSurfaces({
        header: {
          renderAttrs: ['headerContent', 'fontSize']
        },
        bottom: {
          renderAttrs: ['bottomContent', 'fontSize']
        }
      });
      custom.render();

      custom.headerContent = 'modified1';
      // Asserts that surfaces will only re-paint on nextTick
      assert.strictEqual('<b style="font-size:10px;">header</b>', custom.getSurfaceElement('header').innerHTML);
      assert.strictEqual('<span style="font-size:10px;">bottom</span>', custom.getSurfaceElement('bottom').innerHTML);

      lfr.async.nextTick(function() {
        assert.strictEqual('<b style="font-size:10px;">modified1</b>', custom.getSurfaceElement('header').innerHTML);
        assert.strictEqual('<span style="font-size:10px;">bottom</span>', custom.getSurfaceElement('bottom').innerHTML);

        custom.fontSize = '20px';
        // Asserts that surfaces will only re-paint on nextTick
        assert.strictEqual('<b style="font-size:10px;">modified1</b>', custom.getSurfaceElement('header').innerHTML);
        assert.strictEqual('<span style="font-size:10px;">bottom</span>', custom.getSurfaceElement('bottom').innerHTML);

        lfr.async.nextTick(function() {
          assert.strictEqual('<b style="font-size:20px;">modified1</b>', custom.getSurfaceElement('header').innerHTML);
          assert.strictEqual('<span style="font-size:20px;">bottom</span>', custom.getSurfaceElement('bottom').innerHTML);

          // Asserts that it will not repaint if component is not in document
          custom.inDocument = false;
          custom.fontSize = '10px';
          lfr.async.nextTick(function() {
            assert.strictEqual('<b style="font-size:20px;">modified1</b>', custom.getSurfaceElement('header').innerHTML);
            assert.strictEqual('<span style="font-size:20px;">bottom</span>', custom.getSurfaceElement('bottom').innerHTML);
            done();
          });
        });
      });
    });

    it('should not cache surface content if not string', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.prototype.renderInternal = function() {
        this.element.appendChild(this.getSurfaceElement('header'));
        this.element.appendChild(this.getSurfaceElement('bottom'));
      };
      CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
        switch (surfaceId) {
          case 'header':
            return '<div>static</div>';
          case 'body':
            return '<div>static</div>';
          case 'bottom':
            var bottom = document.createElement('div');
            bottom.innerHTML = 'static';
            return bottom;
        }
      };
      var custom = new CustomComponent();
      custom.addSurface('header');
      custom.addSurface('body');
      custom.addSurface('bottom');
      custom.render();

      assert.strictEqual('<div>static</div>', custom.getSurfaceElement('header').innerHTML);
      assert.strictEqual('<div>static</div>', custom.getSurfaceElement('body').innerHTML);
      assert.strictEqual('<div>static</div>', custom.getSurfaceElement('bottom').innerHTML);

      sinon.spy(lfr.dom, 'append');

      custom.renderSurfacesContentIfModified_({
        header: true,
        body: true,
        bottom: true
      });
      assert.strictEqual(1, lfr.dom.append.callCount);
      assert.ok(lfr.dom.append.firstCall.args[0].id.indexOf('-bottom') > 0);

      lfr.dom.append.restore();
    });
  });
});

function createCustomComponentClass() {
  function CustomComponent(opt_config) {
    CustomComponent.base(this, 'constructor', opt_config);
  }
  lfr.inherits(CustomComponent, lfr.Component);

  CustomComponent.prototype.created = sinon.spy();
  CustomComponent.prototype.decorateInternal = sinon.spy();
  CustomComponent.prototype.getSurfaceContent = sinon.spy();
  CustomComponent.prototype.attached = sinon.spy();
  CustomComponent.prototype.detached = sinon.spy();
  CustomComponent.prototype.renderInternal = sinon.spy();

  return CustomComponent;
}
