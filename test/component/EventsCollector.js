'use strict';

import dom from '../../src/dom/dom';
import Component from '../../src/component/Component';
import EventsCollector from '../../src/component/EventsCollector';

describe('EventsCollector', function() {
  it('should fail when component instance is not passed', function() {
    assert.throws(function() {
      new EventsCollector();
    });
  });

  it('should attach event listener', function() {
    var CustomComponent = createCustomComponent(
      '<div data-onclick="handleClick"></div><div></div>'
    );
    CustomComponent.prototype.handleClick = sinon.stub();

    var custom = new CustomComponent().render();
    var collector = new EventsCollector(custom);
    collector.attachListeners(custom.element.innerHTML);

    assert.strictEqual(0, custom.handleClick.callCount);
    dom.triggerEvent(custom.element.childNodes[0], 'click');
    assert.strictEqual(1, custom.handleClick.callCount);
    dom.triggerEvent(custom.element.childNodes[1], 'click');
    assert.strictEqual(1, custom.handleClick.callCount);
  });

  it('should attach multiple event listeners', function() {
    var CustomComponent = createCustomComponent(
      '<div data-onclick="handleClick" data-onkeydown="handleKeyDown"></div>'
    );
    CustomComponent.prototype.handleClick = sinon.stub();
    CustomComponent.prototype.handleKeyDown = sinon.stub();

    var custom = new CustomComponent().render();
    var collector = new EventsCollector(custom);
    collector.attachListeners(custom.element.innerHTML);

    dom.triggerEvent(custom.element.childNodes[0], 'click');
    assert.strictEqual(1, custom.handleClick.callCount);

    dom.triggerEvent(custom.element.childNodes[0], 'keydown');
    assert.strictEqual(1, custom.handleKeyDown.callCount);
  });

  it('should trigger attached listener registered by multiple elements only once', function() {
    var CustomComponent = createCustomComponent(
      '<div data-onclick="handleClick"></div><div data-onclick="handleClick"></div>'
    );
    CustomComponent.prototype.handleClick = sinon.stub();

    var custom = new CustomComponent().render();
    var collector = new EventsCollector(custom);
    collector.attachListeners(custom.element.innerHTML);

    dom.triggerEvent(custom.element.childNodes[0], 'click');
    assert.strictEqual(1, custom.handleClick.callCount);
    dom.triggerEvent(custom.element.childNodes[1], 'click');
    assert.strictEqual(2, custom.handleClick.callCount);
  });

  it('should detach listeners that are unused after collecting again', function() {
    var CustomComponent = createCustomComponent(
      '<div data-onclick="handleClick" data-onkeydown="handleKeyDown"></div>'
    );
    CustomComponent.prototype.handleClick = sinon.stub();
    CustomComponent.prototype.handleKeyDown = sinon.stub();

    var custom = new CustomComponent().render();
    var collector = new EventsCollector(custom);
    collector.attachListeners(custom.element.innerHTML);

    var trigger = custom.element.childNodes[0];
    trigger.removeAttribute('data-onclick');
    custom.element.removeEventListener = sinon.stub();
    collector.attachListeners(custom.element.innerHTML);

    assert.strictEqual(1, custom.element.removeEventListener.callCount);
    assert.strictEqual('click', custom.element.removeEventListener.args[0][0]);
  });

  it('should detach all listeners when detachAllListeners is called', function() {
    var CustomComponent = createCustomComponent(
      '<div data-onclick="handleClick" data-onkeydown="handleKeyDown"></div>'
    );
    CustomComponent.prototype.handleClick = sinon.stub();
    CustomComponent.prototype.handleKeyDown = sinon.stub();

    var custom = new CustomComponent().render();
    var collector = new EventsCollector(custom);
    collector.attachListeners(custom.element.innerHTML);

    collector.detachAllListeners();
    dom.triggerEvent(custom.element.childNodes[0], 'click');
    assert.strictEqual(0, custom.handleClick.callCount);
    dom.triggerEvent(custom.element.childNodes[0], 'keydown');
    assert.strictEqual(0, custom.handleKeyDown.callCount);
  });

  it('should detach remaining listeners when detachAllListeners is called', function() {
    var CustomComponent = createCustomComponent(
      '<div data-onclick="handleClick" data-onkeydown="handleKeyDown"></div>'
    );
    CustomComponent.prototype.handleClick = sinon.stub();
    CustomComponent.prototype.handleKeyDown = sinon.stub();

    var custom = new CustomComponent().render();
    var collector = new EventsCollector(custom);
    collector.attachListeners(custom.element.innerHTML);

    var trigger = custom.element.childNodes[0];
    trigger.removeAttribute('data-onclick');
    collector.attachListeners(custom.element.innerHTML);

    collector.detachAllListeners();
    dom.triggerEvent(custom.element.childNodes[0], 'keydown');
    assert.strictEqual(0, custom.handleKeyDown.callCount);
  });

  it('should detach all listeners when collector is disposed', function() {
    var CustomComponent = createCustomComponent(
      '<div data-onclick="handleClick" data-onkeydown="handleKeyDown"></div>'
    );
    CustomComponent.prototype.handleClick = sinon.stub();
    CustomComponent.prototype.handleKeyDown = sinon.stub();

    var custom = new CustomComponent().render();
    var collector = new EventsCollector(custom);
    collector.attachListeners(custom.element.innerHTML);

    collector.dispose();
    dom.triggerEvent(custom.element.childNodes[0], 'click');
    assert.strictEqual(0, custom.handleClick.callCount);
    dom.triggerEvent(custom.element.childNodes[0], 'keydown');
    assert.strictEqual(0, custom.handleKeyDown.callCount);
  });

  function createCustomComponent(content) {
    class CustomComponent extends Component {
      constructor(opt_config) {
        super(opt_config);
      }
    }
    CustomComponent.prototype.renderInternal = function() {
      dom.append(this.element, content);
    };
    return CustomComponent;
  }
});
