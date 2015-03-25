/* jshint ignore:start */
import ComponentRegistry from '../../../src/component/ComponentRegistry';
var Templates = ComponentRegistry.Templates;
// This file was automatically generated from NestedTestComponent.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Templates.NestedTestComponent.
 * @hassoydeltemplate {ComponentElement}
 * @hassoydeltemplate {ComponentTemplate}
 * @hassoydeltemplate {NestedTestComponent}
 * @hassoydeltemplate {NestedTestComponent.components}
 * @hassoydelcall {ChildrenTestComponent}
 * @hassoydelcall {Component}
 * @hassoydelcall {ComponentElement}
 * @hassoydelcall {NestedTestComponent}
 * @hassoydelcall {NestedTestComponent.components}
 */

if (typeof Templates.NestedTestComponent == 'undefined') { Templates.NestedTestComponent = {}; }


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.NestedTestComponent.content = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('NestedTestComponent.components'), '', true)(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.NestedTestComponent.content.soyTemplateName = 'Templates.NestedTestComponent.content';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.NestedTestComponent.components = function(opt_data, opt_ignored, opt_ijData) {
  var output = '';
  var indexLimit217 = opt_data.count;
  for (var index217 = 0; index217 < indexLimit217; index217++) {
    var childIndex__soy218 = opt_data.invert ? opt_data.count - index217 - 1 : index217;
    output += soy.$$getDelegateFn(soy.$$getDelTemplateId('ChildrenTestComponent'), '', true)({bar: opt_data.foo, id: opt_data.id + 'MyChild' + childIndex__soy218}, null, opt_ijData);
  }
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(output);
};
if (goog.DEBUG) {
  Templates.NestedTestComponent.components.soyTemplateName = 'Templates.NestedTestComponent.components';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.NestedTestComponent.__deltemplate_s222_689a9c9d = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('Component'), '', true)(soy.$$augmentMap(opt_data, {componentName: 'NestedTestComponent'}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.NestedTestComponent.__deltemplate_s222_689a9c9d.soyTemplateName = 'Templates.NestedTestComponent.__deltemplate_s222_689a9c9d';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('NestedTestComponent'), '', 0, Templates.NestedTestComponent.__deltemplate_s222_689a9c9d);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.NestedTestComponent.__deltemplate_s225_0d0356a9 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('ComponentElement'), 'NestedTestComponent', true)(soy.$$augmentMap(opt_data, {elementContent: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + Templates.NestedTestComponent.content(opt_data, null, opt_ijData))}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.NestedTestComponent.__deltemplate_s225_0d0356a9.soyTemplateName = 'Templates.NestedTestComponent.__deltemplate_s225_0d0356a9';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentTemplate'), 'NestedTestComponent', 0, Templates.NestedTestComponent.__deltemplate_s225_0d0356a9);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.NestedTestComponent.__deltemplate_s229_93ce19a3 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<div id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '" class="nestedtestcomponent' + soy.$$escapeHtmlAttribute(opt_data.elementClasses ? ' ' + opt_data.elementClasses : '') + '" data-component="">' + soy.$$escapeHtml(opt_data.elementContent) + '</div>');
};
if (goog.DEBUG) {
  Templates.NestedTestComponent.__deltemplate_s229_93ce19a3.soyTemplateName = 'Templates.NestedTestComponent.__deltemplate_s229_93ce19a3';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('NestedTestComponent'), 'element', 0, Templates.NestedTestComponent.__deltemplate_s229_93ce19a3);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.NestedTestComponent.__deltemplate_s237_c3a53166 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('NestedTestComponent'), 'element', true)(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.NestedTestComponent.__deltemplate_s237_c3a53166.soyTemplateName = 'Templates.NestedTestComponent.__deltemplate_s237_c3a53166';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentElement'), 'NestedTestComponent', 0, Templates.NestedTestComponent.__deltemplate_s237_c3a53166);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.NestedTestComponent.__deltemplate_s239_ec858f3e = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<div id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '-components">' + soy.$$escapeHtml(opt_data.elementContent) + '</div>');
};
if (goog.DEBUG) {
  Templates.NestedTestComponent.__deltemplate_s239_ec858f3e.soyTemplateName = 'Templates.NestedTestComponent.__deltemplate_s239_ec858f3e';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('NestedTestComponent.components'), 'element', 0, Templates.NestedTestComponent.__deltemplate_s239_ec858f3e);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.NestedTestComponent.__deltemplate_s245_1089cef5 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('NestedTestComponent.components'), 'element', true)(soy.$$augmentMap(opt_data, {elementContent: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + ((! opt_ijData.skipSurfaceContents) ? Templates.NestedTestComponent.components(opt_data, null, opt_ijData) : ''))}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.NestedTestComponent.__deltemplate_s245_1089cef5.soyTemplateName = 'Templates.NestedTestComponent.__deltemplate_s245_1089cef5';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('NestedTestComponent.components'), '', 0, Templates.NestedTestComponent.__deltemplate_s245_1089cef5);

Templates.NestedTestComponent.components.params = ["count","foo","id","invert"];
/* jshint ignore:end */
