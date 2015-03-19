'use strict';

import ComponentRegistry from '../../src/component/ComponentRegistry';

import '../../src/soy/SoyComponent.soy';

var Templates = ComponentRegistry.Templates;

describe('SoyComponent.soy', function() {
  it('should store component template', function() {
    assert.ok(Templates.SoyComponent);
  });

  describe('Template: .component', function() {
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
