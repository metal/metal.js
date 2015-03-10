'use strict';

import dom from '../../src/dom/dom';
import ComponentRegistry from '../../src/component/ComponentRegistry';

import '../../src/soy/SoyComponent.soy';

var Templates = ComponentRegistry.Templates;

describe('SoyComponent.soy', function() {
  before(function() {
    sinon.stub(soy, '$$getDelegateFn').returns(function(data) {
      return 'My Template ' + data.foo;
    });
  });

  after(function() {
    soy.$$getDelegateFn.restore();
  });

  it('should store component template', function() {
    assert.ok(Templates.SoyComponent);
  });

  it('should render component wrapper', function() {
    var rendered = Templates.SoyComponent.component({
      componentName: 'MyComponent',
      foo: 'Foo',
      ref: 'ref'
    }, null, {});

    var element = dom.buildFragment(rendered.content);
    var wrapper = element.querySelector('[data-component]');

    assert.ok(wrapper);
    assert.strictEqual('MyComponent', wrapper.getAttribute('data-component'));
    assert.strictEqual('ref', wrapper.getAttribute('data-ref'));
    assert.strictEqual('', wrapper.innerHTML);
  });

  it('should render component template inside wrapper if renderChildComponents is true', function() {
    var rendered = Templates.SoyComponent.component({
      componentName: 'MyComponent',
      foo: 'Foo',
      parentId: 'parentId',
      ref: 'ref'
    }, null, {renderChildComponents: true});

    var element = dom.buildFragment(rendered.content);
    var wrapper = element.querySelector('[data-component]');

    assert.strictEqual('My Template Foo', wrapper.innerHTML);
  });
});
