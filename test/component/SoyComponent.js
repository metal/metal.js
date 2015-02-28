'use strict';

import {async} from '../../src/promise/Promise';
import core from '../../src/core';
import SoyComponent from '../../src/component/SoyComponent';

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

  function createCustomComponentClass() {
    function CustomComponent(opt_config) {
      CustomComponent.base(this, 'constructor', opt_config);
    }
    core.inherits(CustomComponent, SoyComponent);
    return CustomComponent;
  }
});
