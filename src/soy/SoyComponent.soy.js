/* jshint ignore:start */
import ComponentRegistry from '../component/ComponentRegistry';
var Templates = ComponentRegistry.Templates;
// This file was automatically generated from SoyComponent.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Templates.SoyComponent.
 * @hassoydeltemplate {Component}
 * @hassoydeltemplate {ComponentChildren}
 * @hassoydeltemplate {ComponentElement}
 * @hassoydelcall {ComponentElement}
 * @hassoydelcall {ComponentTemplate}
 */

if (typeof Templates.SoyComponent == 'undefined') { Templates.SoyComponent = {}; }


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.SoyComponent.component = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml((opt_ijData.renderChildComponents) ? soy.$$escapeHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('ComponentTemplate'), opt_data.componentName, true)(opt_data, null, opt_ijData)) : soy.$$getDelegateFn(soy.$$getDelTemplateId('ComponentElement'), opt_data.componentName, true)(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.SoyComponent.component.soyTemplateName = 'Templates.SoyComponent.component';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.SoyComponent.__deltemplate_s8_0084916f = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(Templates.SoyComponent.component(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.SoyComponent.__deltemplate_s8_0084916f.soyTemplateName = 'Templates.SoyComponent.__deltemplate_s8_0084916f';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('Component'), '', 0, Templates.SoyComponent.__deltemplate_s8_0084916f);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.SoyComponent.__deltemplate_s10_26860e4b = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<div id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '-children-placeholder" data-component-children>' + ((opt_ijData.renderChildComponents) ? soy.$$escapeHtml(opt_data.children) : '') + '</div>');
};
if (goog.DEBUG) {
  Templates.SoyComponent.__deltemplate_s10_26860e4b.soyTemplateName = 'Templates.SoyComponent.__deltemplate_s10_26860e4b';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentChildren'), '', 0, Templates.SoyComponent.__deltemplate_s10_26860e4b);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.SoyComponent.__deltemplate_s18_40718f6d = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<div id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '" class="' + soy.$$escapeHtmlAttribute(opt_data.elementClasses ? opt_data.elementClasses : '') + '" data-component>' + ((opt_data.elementContent) ? soy.$$escapeHtml(opt_data.elementContent) : '') + '</div>');
};
if (goog.DEBUG) {
  Templates.SoyComponent.__deltemplate_s18_40718f6d.soyTemplateName = 'Templates.SoyComponent.__deltemplate_s18_40718f6d';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentElement'), '', 0, Templates.SoyComponent.__deltemplate_s18_40718f6d);

/* jshint ignore:end */
