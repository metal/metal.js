/* jshint ignore:start */
import ComponentRegistry from '../../../../src/component/ComponentRegistry';
var Templates = ComponentRegistry.Templates;
// This file was automatically generated from ChildrenTestComponent.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Templates.ChildrenTestComponent.
 * @hassoydeltemplate {ChildrenTestComponent}
 * @hassoydeltemplate {ChildrenTestComponent.children}
 * @hassoydeltemplate {ComponentElement}
 * @hassoydeltemplate {ComponentTemplate}
 * @hassoydelcall {ChildrenTestComponent}
 * @hassoydelcall {ChildrenTestComponent.children}
 * @hassoydelcall {Component}
 * @hassoydelcall {ComponentChildren}
 * @hassoydelcall {ComponentElement}
 * @hassoydelcall {Surface}
 */

if (typeof Templates.ChildrenTestComponent == 'undefined') { Templates.ChildrenTestComponent = {}; }


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.ChildrenTestComponent.content = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('ChildrenTestComponent.children'), '', true)(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.ChildrenTestComponent.content.soyTemplateName = 'Templates.ChildrenTestComponent.content';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.ChildrenTestComponent.children = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$escapeHtml(opt_data.bar) + soy.$$getDelegateFn(soy.$$getDelTemplateId('ComponentChildren'), '', true)(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.ChildrenTestComponent.children.soyTemplateName = 'Templates.ChildrenTestComponent.children';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.ChildrenTestComponent.__deltemplate_s24_23bf31c5 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('Component'), '', true)(soy.$$augmentMap(opt_data, {componentName: 'ChildrenTestComponent'}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.ChildrenTestComponent.__deltemplate_s24_23bf31c5.soyTemplateName = 'Templates.ChildrenTestComponent.__deltemplate_s24_23bf31c5';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ChildrenTestComponent'), '', 0, Templates.ChildrenTestComponent.__deltemplate_s24_23bf31c5);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.ChildrenTestComponent.__deltemplate_s27_cf5778f1 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('ComponentElement'), 'ChildrenTestComponent', true)(soy.$$augmentMap(opt_data, {elementContent: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + Templates.ChildrenTestComponent.content(opt_data, null, opt_ijData))}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.ChildrenTestComponent.__deltemplate_s27_cf5778f1.soyTemplateName = 'Templates.ChildrenTestComponent.__deltemplate_s27_cf5778f1';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentTemplate'), 'ChildrenTestComponent', 0, Templates.ChildrenTestComponent.__deltemplate_s27_cf5778f1);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.ChildrenTestComponent.__deltemplate_s31_4b28d686 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('ChildrenTestComponent'), 'element', true)(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.ChildrenTestComponent.__deltemplate_s31_4b28d686.soyTemplateName = 'Templates.ChildrenTestComponent.__deltemplate_s31_4b28d686';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentElement'), 'ChildrenTestComponent', 0, Templates.ChildrenTestComponent.__deltemplate_s31_4b28d686);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.ChildrenTestComponent.__deltemplate_s33_2820b540 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<div id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '" class="childrentestcomponent component' + soy.$$escapeHtmlAttribute(opt_data.elementClasses ? ' ' + opt_data.elementClasses : '') + '" data-component="">' + soy.$$escapeHtml(opt_data.elementContent) + '</div>');
};
if (goog.DEBUG) {
  Templates.ChildrenTestComponent.__deltemplate_s33_2820b540.soyTemplateName = 'Templates.ChildrenTestComponent.__deltemplate_s33_2820b540';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ChildrenTestComponent'), 'element', 0, Templates.ChildrenTestComponent.__deltemplate_s33_2820b540);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.ChildrenTestComponent.__deltemplate_s41_b6eb50e5 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<div id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '-children">' + soy.$$escapeHtml(opt_data.elementContent) + '</div>');
};
if (goog.DEBUG) {
  Templates.ChildrenTestComponent.__deltemplate_s41_b6eb50e5.soyTemplateName = 'Templates.ChildrenTestComponent.__deltemplate_s41_b6eb50e5';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ChildrenTestComponent.children'), 'element', 0, Templates.ChildrenTestComponent.__deltemplate_s41_b6eb50e5);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.ChildrenTestComponent.__deltemplate_s47_095ec0e8 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('ChildrenTestComponent.children'), 'element', true)(soy.$$augmentMap(opt_data, {elementContent: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + ((! opt_ijData.skipSurfaceContents) ? soy.$$getDelegateFn(soy.$$getDelTemplateId('Surface'), '', true)({content: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + Templates.ChildrenTestComponent.children(opt_data, null, opt_ijData)), id: opt_data.id + '-children'}, null, opt_ijData) : ''))}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.ChildrenTestComponent.__deltemplate_s47_095ec0e8.soyTemplateName = 'Templates.ChildrenTestComponent.__deltemplate_s47_095ec0e8';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ChildrenTestComponent.children'), '', 0, Templates.ChildrenTestComponent.__deltemplate_s47_095ec0e8);

Templates.ChildrenTestComponent.children.params = ["bar"];
/* jshint ignore:end */
