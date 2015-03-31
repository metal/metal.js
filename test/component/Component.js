'use strict';

import async from '../../src/async/async';
import dom from '../../src/dom/dom';
import Component from '../../src/component/Component';

describe('Component', function() {
  afterEach(function() {
    document.body.innerHTML = '';
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
      custom.detach(); // Allow multiple
      assert.strictEqual(null, document.getElementById(custom.id));
      assert.strictEqual(false, custom.inDocument);
      sinon.assert.callCount(CustomComponent.prototype.detached, 1);

      custom.attach();
      custom.attach(); // Allow multiple
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

    it('should use first defined tag name', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.ELEMENT_TAG_NAME = 'span';

      class ChildComponent extends CustomComponent {
        constructor(opt_config) {
          super(opt_config);
        }
      }

      var custom = new ChildComponent();
      custom.render();
      assert.strictEqual('span', custom.element.tagName.toLowerCase());
    });

    it('should return component instance from lifecycle methods', function() {
      var CustomComponent = createCustomComponentClass();
      var custom = new CustomComponent();

      assert.strictEqual(custom, custom.render());
      assert.strictEqual(custom, custom.detach());
      assert.strictEqual(custom, custom.decorate());

      custom.detach();
      assert.strictEqual(custom, custom.attach());
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

    it('should set component element attr from selector', function() {
      var CustomComponent = createCustomComponentClass();

      var element = document.createElement('div');
      element.className = 'myClass';
      document.body.appendChild(element);

      var custom = new CustomComponent({
        element: '.myClass'
      });
      custom.render();
      assert.strictEqual(element, custom.element);
    });

    it('should set component element to default value if selector doesn\'t match any element', function() {
      var CustomComponent = createCustomComponentClass();

      var custom = new CustomComponent({
        element: '.myClass'
      });
      custom.render();
      assert.ok(custom.element);
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

    it('should set component elementClasses attr', function(done) {
      var CustomComponent = createCustomComponentClass();

      var custom = new CustomComponent({
        elementClasses: 'foo bar'
      });
      custom.render();

      assert.strictEqual(3, getClassNames(custom.element).length);
      assert.strictEqual('component', getClassNames(custom.element)[0]);
      assert.strictEqual('foo', getClassNames(custom.element)[1]);
      assert.strictEqual('bar', getClassNames(custom.element)[2]);

      custom.elementClasses = 'other';
      async.nextTick(function() {
        assert.strictEqual(2, getClassNames(custom.element).length);
        assert.strictEqual('component', getClassNames(custom.element)[0]);
        assert.strictEqual('other', getClassNames(custom.element)[1]);
        done();
      });
    });

    it('should add default component elementClasses from static hint', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.ELEMENT_CLASSES = 'overwritten1 overwritten2';

      var custom = new CustomComponent();
      custom.render();
      assert.strictEqual(3, getClassNames(custom.element).length);
      assert.strictEqual('overwritten1', getClassNames(custom.element)[0]);
      assert.strictEqual('overwritten2', getClassNames(custom.element)[1]);
      assert.strictEqual('component', getClassNames(custom.element)[2]);
    });

    it('should fire synchronize attr synchronously on render and asynchronously when attr value change', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.ATTRS = {
        foo: {
          value: 0
        }
      };
      CustomComponent.prototype.syncUnkown = sinon.spy();
      CustomComponent.prototype.syncFoo = sinon.spy();

      var custom = new CustomComponent({
        foo: 10
      });
      sinon.assert.notCalled(CustomComponent.prototype.syncUnkown);
      sinon.assert.notCalled(CustomComponent.prototype.syncFoo);
      custom.render();
      sinon.assert.notCalled(CustomComponent.prototype.syncUnkown);
      sinon.assert.callCount(CustomComponent.prototype.syncFoo, 1);
      assert.strictEqual(10, CustomComponent.prototype.syncFoo.args[0][0]);

      custom.foo = 20;
      sinon.assert.callCount(CustomComponent.prototype.syncFoo, 1);
      async.nextTick(function() {
        sinon.assert.callCount(CustomComponent.prototype.syncFoo, 2);
        assert.strictEqual(20, CustomComponent.prototype.syncFoo.args[1][0]);
      });

      custom.unknown = 20;
      sinon.assert.notCalled(CustomComponent.prototype.syncUnkown);
      async.nextTick(function() {
        sinon.assert.notCalled(CustomComponent.prototype.syncUnkown);
      });
    });

    it('should fire sync methods for attrs defined by super classes as well', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.ATTRS = {
        foo: {
          value: 0
        }
      };

      class ChildComponent extends CustomComponent {
        constructor(opt_config) {
          super(opt_config);
        }
      }

      ChildComponent.ATTRS = {
        bar: {
          value: 1
        }
      };

      var custom = new ChildComponent();
      custom.syncFoo = sinon.spy();
      custom.syncBar = sinon.spy();
      custom.render();
      sinon.assert.callCount(custom.syncFoo, 1);
      sinon.assert.callCount(custom.syncBar, 1);
    });

    it('should not allow defining attribute named componentName', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.ATTRS = {
        componentName: {}
      };

      assert.throws(function() {
        new CustomComponent();
      });
    });

    it('should not allow defining attribute named components', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.ATTRS = {
        components: {}
      };

      assert.throws(function() {
        new CustomComponent();
      });
    });

    it('should not allow defining attribute named elementContent', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.ATTRS = {
        elementContent: {}
      };

      assert.throws(function() {
        new CustomComponent();
      });
    });

    it('should not allow defining attribute named ref', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.ATTRS = {
        ref: {}
      };

      assert.throws(function() {
        new CustomComponent();
      });
    });
  });

  describe('Render', function() {
    it('should render component on body if no parent is specified', function() {
      var CustomComponent = createCustomComponentClass();
      var custom = new CustomComponent();
      custom.render();

      assert.strictEqual(document.body, custom.element.parentNode);
    });

    it('should render component on requested parent', function() {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var CustomComponent = createCustomComponentClass();
      var custom = new CustomComponent();
      custom.render(container);

      assert.strictEqual(container, custom.element.parentNode);
    });

    it('should render component on requested parent selector', function() {
      var container = document.createElement('div');
      container.className = 'myContainer';
      document.body.appendChild(container);

      var CustomComponent = createCustomComponentClass();
      var custom = new CustomComponent();
      custom.render('.myContainer');

      assert.strictEqual(container, custom.element.parentNode);
    });

    it('should render component on requested parent at specified position', function() {
      var container = document.createElement('div');
      var sibling1 = document.createElement('div');
      var sibling2 = document.createElement('div');
      container.appendChild(sibling1);
      container.appendChild(sibling2);
      document.body.appendChild(container);

      var CustomComponent = createCustomComponentClass();
      var custom = new CustomComponent();
      custom.render(container, sibling2);

      assert.strictEqual(container, custom.element.parentNode);
      assert.strictEqual(custom.element, sibling1.nextSibling);
      assert.strictEqual(sibling2, custom.element.nextSibling);
    });

    it('should render component according to specified sibling selector', function() {
      var container = document.createElement('div');
      var sibling1 = document.createElement('div');
      var sibling2 = document.createElement('div');
      sibling2.className = 'mySibling';
      container.appendChild(sibling1);
      container.appendChild(sibling2);
      document.body.appendChild(container);

      var CustomComponent = createCustomComponentClass();
      var custom = new CustomComponent();
      custom.render(container, '.mySibling');

      assert.strictEqual(container, custom.element.parentNode);
      assert.strictEqual(custom.element, sibling1.nextSibling);
      assert.strictEqual(sibling2, custom.element.nextSibling);
    });
  });

  describe('Events', function() {
    it('should listen to events on the element through Component\'s "on" function', function() {
      var CustomComponent = createCustomComponentClass();
      var custom = new CustomComponent();
      custom.render();

      var element = custom.element;
      element.onclick = null;
      var listener = sinon.stub();
      custom.on('click', listener);

      dom.triggerEvent(element, 'click');
      assert.strictEqual(1, listener.callCount);

      custom.dispose();
      dom.triggerEvent(element, 'click');
      assert.strictEqual(1, listener.callCount);
    });

    it('should listen to delegate events on the element', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.prototype.renderInternal = function() {
        this.element.innerHTML = '<div class="foo"></div>';
      };
      var custom = new CustomComponent();
      custom.render();

      var fooElement = custom.element.querySelector('.foo');
      var listener = sinon.stub();
      custom.delegate('click', '.foo', listener);

      dom.triggerEvent(fooElement, 'click');
      assert.strictEqual(1, listener.callCount);

      custom.dispose();
      dom.triggerEvent(fooElement, 'click');
      assert.strictEqual(1, listener.callCount);
    });
  });

  describe('Surfaces', function() {
    it('should aggregate surfaces from hierarchy static hint', function() {
      var ParentComponent = createCustomComponentClass();
      ParentComponent.SURFACES = {
        header: {},
        bottom: {}
      };

      class ChildComponent extends ParentComponent {
        constructor(opt_config) {
          super(opt_config);
        }
      }

      ChildComponent.SURFACES = {
        content: {}
      };

      var child = new ChildComponent();
      assert.deepEqual(['header', 'bottom', 'content'], Object.keys(child.getSurfaces()));

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
      assert.deepEqual(['header', 'bottom'], Object.keys(custom.getSurfaces()));
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

    it('should use first defined surface tag name', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.SURFACE_TAG_NAME = 'span';

      class ChildComponent extends CustomComponent {
        constructor(opt_config) {
          super(opt_config);
        }
      }

      var custom = new ChildComponent();
      custom.addSurface('header');
      custom.render();
      assert.strictEqual('span', custom.getSurfaceElement('header').tagName.toLowerCase());
    });

    it('should create surface element if it hasn\'t been created before', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.SURFACES = {
        header: {}
      };

      var custom = new CustomComponent();
      var surface = custom.getSurfaceElement('header');

      assert.ok(surface);
      assert.strictEqual(surface, custom.getSurfaceElement('header'));
    });

    it('should not share same surface config object between instances', function() {
      var CustomComponent = createCustomComponentClass();
      CustomComponent.SURFACES = {
        header: {}
      };

      var custom1 = new CustomComponent();
      var custom2 = new CustomComponent();

      assert.ok(custom1.getSurface('header') !== custom2.getSurface('header'));
    });

    it('should get surface element from the document when it exists', function() {
      var element = document.createElement('div');
      element.id = 'custom';
      var surface = document.createElement('div');
      surface.id = 'custom-header';
      element.appendChild(surface);
      document.body.appendChild(element);

      var CustomComponent = createCustomComponentClass();
      CustomComponent.SURFACES = {
        header: {}
      };
      var custom = new CustomComponent({
        element: element
      });

      assert.strictEqual(surface, custom.getSurfaceElement('header'));
    });

    it('should get surface element from element even if not on the document', function() {
      var surface = document.createElement('div');
      surface.id = 'custom-header';

      var CustomComponent = createCustomComponentClass();
      CustomComponent.SURFACES = {
        header: {}
      };
      CustomComponent.prototype.renderInternal = function() {
        this.element.appendChild(surface);
      };
      CustomComponent.prototype.getSurfaceContent = function() {
        return 'Header';
      };
      var custom = new CustomComponent({
        id: 'custom'
      });
      custom.render();

      assert.strictEqual(surface, custom.getSurfaceElement('header'));
      assert.strictEqual('Header', custom.getSurfaceElement('header').innerHTML);
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

    it('should render surface content when surface render attrs change', function(done) {
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
      assert.strictEqual('header', custom.getSurfaceElement('header').querySelector('b').innerHTML);
      assert.strictEqual('10px', custom.getSurfaceElement('bottom').querySelector('span').style.fontSize);

      async.nextTick(function() {
        assert.strictEqual('modified1', custom.getSurfaceElement('header').querySelector('b').innerHTML);
        assert.strictEqual('10px', custom.getSurfaceElement('bottom').querySelector('span').style.fontSize);

        custom.fontSize = '20px';
        // Asserts that surfaces will only re-paint on nextTick
        assert.strictEqual('modified1', custom.getSurfaceElement('header').querySelector('b').innerHTML);
        assert.strictEqual('10px', custom.getSurfaceElement('bottom').querySelector('span').style.fontSize);

        async.nextTick(function() {
          assert.strictEqual('20px', custom.getSurfaceElement('header').querySelector('b').style.fontSize);
          assert.strictEqual('20px', custom.getSurfaceElement('bottom').querySelector('span').style.fontSize);

          // Asserts that it will not repaint if component is not in document
          custom.inDocument = false;
          custom.fontSize = '10px';
          async.nextTick(function() {
            assert.strictEqual('20px', custom.getSurfaceElement('header').querySelector('b').style.fontSize);
            assert.strictEqual('20px', custom.getSurfaceElement('bottom').querySelector('span').style.fontSize);
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

      sinon.spy(dom, 'append');

      custom.renderSurfacesContent_({
        header: true,
        body: true,
        bottom: true
      });
      assert.ok(!custom.getSurface('header').cacheMiss);
      assert.ok(!custom.getSurface('body').cacheMiss);
      assert.ok(custom.getSurface('bottom').cacheMiss);

      dom.append.restore();
    });

    it('should return component instance from surface methods', function() {
      var CustomComponent = createCustomComponentClass();
      var custom = new CustomComponent();

      assert.strictEqual(custom, custom.addSurface('header'));
      assert.strictEqual(custom, custom.addSurfaces({}));
      assert.strictEqual(custom, custom.removeSurface('header'));
    });
  });

  function createCustomComponentClass() {
    class CustomComponent extends Component {
      constructor(opt_config) {
        super(opt_config);
      }
    }

    CustomComponent.prototype.created = sinon.spy();
    CustomComponent.prototype.decorateInternal = sinon.spy();
    CustomComponent.prototype.getSurfaceContent = sinon.spy();
    CustomComponent.prototype.attached = sinon.spy();
    CustomComponent.prototype.detached = sinon.spy();
    CustomComponent.prototype.renderInternal = sinon.spy();

    return CustomComponent;
  }

  function getClassNames(element) {
    return element.className.trim().split(' ');
  }
});
