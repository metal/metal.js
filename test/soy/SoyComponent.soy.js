'use strict';

import dom from '../../src/dom/dom';
import ComponentRegistry from '../../src/component/ComponentRegistry';

import '../../src/soy/SoyComponent.soy';

var Templates = ComponentRegistry.Templates;

describe('SoyComponent.soy', function() {
  it('should store component template', function() {
    assert.ok(Templates.SoyComponent);
  });

  describe('Template: .component', function() {
    it('should render component wrapper', function() {
      var rendered = Templates.SoyComponent.component({
        componentName: 'MyComponent',
        foo: 'Foo',
        ref: 'ref'
      }, null, {});

      var element = dom.buildFragment(rendered.content);
      var wrapper = element.querySelector('[data-component]');

      assert.ok(wrapper);
      assert.strictEqual('DIV', wrapper.tagName);
      assert.strictEqual('MyComponent', wrapper.getAttribute('data-component'));
      assert.strictEqual('ref', wrapper.getAttribute('data-ref'));
      assert.strictEqual('', wrapper.innerHTML);
    });

    it('should render component template if renderChildComponents is true', function() {
      sinon.stub(soy, '$$getDelegateFn').returns(function(data) {
        return 'My Template ' + data.foo;
      });

      var rendered = Templates.SoyComponent.component({
        componentName: 'MyComponent',
        foo: 'Foo',
        parentId: 'parentId',
        ref: 'ref'
      }, null, {renderChildComponents: true});

      assert.strictEqual('My Template Foo', rendered.content);
      soy.$$getDelegateFn.restore();
    });
  });
});
