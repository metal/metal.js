/* jshint ignore:start */
import ComponentRegistry from '../../../../src/component/ComponentRegistry';
var Templates = ComponentRegistry.Templates;
// This file was automatically generated from ComponentAttrTestComponent.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Templates.ComponentAttrTestComponent.
 * @hassoydeltemplate {ComponentAttrTestComponent}
 * @hassoydeltemplate {ComponentElement}
 * @hassoydeltemplate {ComponentTemplate}
 * @hassoydelcall {ChildrenTestComponent}
 * @hassoydelcall {Component}
 * @hassoydelcall {ComponentAttrTestComponent}
 * @hassoydelcall {ComponentElement}
 */

if (typeof Templates.ComponentAttrTestComponent == 'undefined') { Templates.ComponentAttrTestComponent = {}; }


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.ComponentAttrTestComponent.content = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('ChildrenTestComponent'), '', true)({id: opt_data.id + 'Child', moreComponents: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + soy.$$getDelegateFn(soy.$$getDelTemplateId('ChildrenTestComponent'), '', true)({id: opt_data.id + 'More'}, null, opt_ijData))}, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.ComponentAttrTestComponent.content.soyTemplateName = 'Templates.ComponentAttrTestComponent.content';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.ComponentAttrTestComponent.__deltemplate_s63_0f8ac87e = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('Component'), '', true)(soy.$$augmentMap(opt_data, {componentName: 'ComponentAttrTestComponent'}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.ComponentAttrTestComponent.__deltemplate_s63_0f8ac87e.soyTemplateName = 'Templates.ComponentAttrTestComponent.__deltemplate_s63_0f8ac87e';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentAttrTestComponent'), '', 0, Templates.ComponentAttrTestComponent.__deltemplate_s63_0f8ac87e);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.ComponentAttrTestComponent.__deltemplate_s66_5c7569b8 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('ComponentElement'), 'ComponentAttrTestComponent', true)(soy.$$augmentMap(opt_data, {elementContent: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + Templates.ComponentAttrTestComponent.content(opt_data, null, opt_ijData))}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.ComponentAttrTestComponent.__deltemplate_s66_5c7569b8.soyTemplateName = 'Templates.ComponentAttrTestComponent.__deltemplate_s66_5c7569b8';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentTemplate'), 'ComponentAttrTestComponent', 0, Templates.ComponentAttrTestComponent.__deltemplate_s66_5c7569b8);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.ComponentAttrTestComponent.__deltemplate_s70_e842a02d = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<div id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '" class="componentattrtestcomponent component' + soy.$$escapeHtmlAttribute(opt_data.elementClasses ? ' ' + opt_data.elementClasses : '') + '" data-component="">' + soy.$$escapeHtml(opt_data.elementContent) + '</div>');
};
if (goog.DEBUG) {
  Templates.ComponentAttrTestComponent.__deltemplate_s70_e842a02d.soyTemplateName = 'Templates.ComponentAttrTestComponent.__deltemplate_s70_e842a02d';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentAttrTestComponent'), 'element', 0, Templates.ComponentAttrTestComponent.__deltemplate_s70_e842a02d);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.ComponentAttrTestComponent.__deltemplate_s78_1867b73f = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('ComponentAttrTestComponent'), 'element', true)(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.ComponentAttrTestComponent.__deltemplate_s78_1867b73f.soyTemplateName = 'Templates.ComponentAttrTestComponent.__deltemplate_s78_1867b73f';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentElement'), 'ComponentAttrTestComponent', 0, Templates.ComponentAttrTestComponent.__deltemplate_s78_1867b73f);

Templates.ComponentAttrTestComponent.content.params = ["id"];
/* jshint ignore:end */
