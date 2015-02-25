'use strict';

import {async} from '../../src/promise/Promise';
import dom from '../../src/dom/dom';
import EventsCollector from '../../src/component/EventsCollector';
import SoyComponent from '../../src/soy/SoyComponent';

describe('EventsCollector', function() {
  afterEach(function() {
    document.body.innerHTML = '';
  });

  it('should fail when component instance is not passed', function() {
    assert.throws(function() {
      new EventsCollector();
    });
  });

  it('should attach events when specified in the template on render', function() {
    var CustomComponent = createCustomComponentClass();
    var custom = new CustomComponent();
    custom.handleClick = sinon.stub();
    custom.handleButtonClick = sinon.stub();
    custom.render();
    assertEventsCalled(custom);
    custom.detach();
    custom.attach();
    assertEventsCalled(custom);
    custom.dispose();
  });

  it('should attach events when specified in the template on decorate', function() {
    var CustomComponent = createCustomComponentClass();
    var custom = new CustomComponent();
    custom.handleClick = sinon.stub();
    custom.handleButtonClick = sinon.stub();
    custom.renderInternal(); // Manual invoke to prepare surfaces.
    custom.decorate();
    assertEventsCalled(custom);
    custom.dispose();
  });

  it('should re-attach surface events when surface content is updated', function(done) {
    var CustomComponent = createCustomComponentClass();
    var custom = new CustomComponent();
    custom.handleClick = sinon.stub();
    custom.handleButtonClick = sinon.stub();
    custom.handleButtonMousedown = sinon.stub();
    custom.render();
    assertEventsCalled(custom);

    custom.bodyContent = '<div id="innerButton" onmousedown="handleButtonMousedown"></div>';
    async.nextTick(function() {
      var innerButton = custom.getSurfaceElement('body').querySelector('#innerButton');
      dom.triggerEvent(innerButton, 'click');
      dom.triggerEvent(innerButton, 'mousedown');

      assert.ok(custom.handleClick.calledThrice, 'Click on parent element should trigger click event');
      assert.ok(custom.handleButtonMousedown.calledOnce, 'Click on parent element should trigger click event');

      custom.dispose();
      done();
    });
  });

  it('should detach events when component is disposed', function() {
    var CustomComponent = createCustomComponentClass();
    var custom = new CustomComponent();
    custom.handleClick = sinon.stub();
    custom.handleButtonClick = sinon.stub();
    custom.render();
    assertEventsCalled(custom);
    custom.getEventsCollector_().dispose();
    assertEventsCalled(custom);
  });

  function createCustomComponentClass() {
    class CustomComponent extends SoyComponent {
      constructor(opt_config) {
        super(opt_config);
      }
    }

    CustomComponent.ATTRS = {
      bodyContent: {
        value: '<div id="innerButton" onclick="handleButtonClick"></div>'
      },
      footerContent: {
        value: 'Hello World from footer'
      },
      headerContent: {
        value: 'Hello World from header'
      }
    };

    CustomComponent.SURFACES = {
      body: {
        renderAttrs: ['bodyContent']
      },
      header: {
        renderAttrs: ['headerContent']
      },
      footer: {
        renderAttrs: ['footerContent']
      }
    };

    CustomComponent.TEMPLATES = {
      element: function(data) {
        return {
          content: '<div id="' + data.id + '-header" onclick="handleClick"></div>' +
            '<div id="' + data.id + '-body" onclick="handleClick"></div>' +
            '<div id="' + data.id + '-footer" onclick="handleClick"></div>'
        };
      },
      body: function(data) {
        return {
          content: '<div>' + data.bodyContent + '</div>'
        };
      },
      header: function(data) {
        return {
          content: '<p>' + data.headerContent + '</p>'
        };
      },
      footer: function(data) {
        return {
          content: '<p>' + data.footerContent + '</p>'
        };
      }
    };

    return CustomComponent;
  }

  var assertEventsCalled = function(instance) {
    var headerElement = instance.getSurfaceElement('header');
    dom.triggerEvent(headerElement, 'click');

    var footerElement = instance.getSurfaceElement('footer');
    dom.triggerEvent(footerElement, 'click');

    var innerButton = instance.getSurfaceElement('body').querySelector('#innerButton');
    dom.triggerEvent(innerButton, 'click');

    assert.ok(instance.handleClick.calledThrice, 'Click on parent element should trigger click event');
    assert.ok(instance.handleButtonClick.calledOnce, 'Click on child element should trigger click event');
  };

});
