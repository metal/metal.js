/* jshint ignore:start */
import ComponentRegistry from '../../../../src/component/ComponentRegistry';
var Templates = ComponentRegistry.Templates;
// This file was automatically generated from CustomTestComponent.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Templates.CustomTestComponent.
 * @hassoydeltemplate {ComponentElement}
 * @hassoydeltemplate {ComponentTemplate}
 * @hassoydeltemplate {CustomTestComponent}
 * @hassoydeltemplate {CustomTestComponent.footer}
 * @hassoydeltemplate {CustomTestComponent.header}
 * @hassoydelcall {Component}
 * @hassoydelcall {ComponentElement}
 * @hassoydelcall {CustomTestComponent}
 * @hassoydelcall {CustomTestComponent.footer}
 * @hassoydelcall {CustomTestComponent.header}
 * @hassoydelcall {Surface}
 */

if (typeof Templates.CustomTestComponent == 'undefined') { Templates.CustomTestComponent = {}; }


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.CustomTestComponent.content = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('CustomTestComponent.header'), '', true)(opt_data, null, opt_ijData) + soy.$$getDelegateFn(soy.$$getDelTemplateId('CustomTestComponent.footer'), '', true)(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.CustomTestComponent.content.soyTemplateName = 'Templates.CustomTestComponent.content';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.CustomTestComponent.header = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$escapeHtml(opt_data.headerContent));
};
if (goog.DEBUG) {
  Templates.CustomTestComponent.header.soyTemplateName = 'Templates.CustomTestComponent.header';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.CustomTestComponent.footer = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$escapeHtml(opt_data.footerContent));
};
if (goog.DEBUG) {
  Templates.CustomTestComponent.footer.soyTemplateName = 'Templates.CustomTestComponent.footer';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.CustomTestComponent.__deltemplate_s88_e76f4e0e = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<custom id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '" class="btn ' + soy.$$escapeHtmlAttribute(opt_data.elementClasses ? opt_data.elementClasses : '') + '" data-component>' + soy.$$escapeHtml(opt_data.elementContent) + '</custom>');
};
if (goog.DEBUG) {
  Templates.CustomTestComponent.__deltemplate_s88_e76f4e0e.soyTemplateName = 'Templates.CustomTestComponent.__deltemplate_s88_e76f4e0e';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('CustomTestComponent'), 'element', 0, Templates.CustomTestComponent.__deltemplate_s88_e76f4e0e);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.CustomTestComponent.__deltemplate_s96_691db6c1 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('Component'), '', true)(soy.$$augmentMap(opt_data, {componentName: 'CustomTestComponent'}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.CustomTestComponent.__deltemplate_s96_691db6c1.soyTemplateName = 'Templates.CustomTestComponent.__deltemplate_s96_691db6c1';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('CustomTestComponent'), '', 0, Templates.CustomTestComponent.__deltemplate_s96_691db6c1);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.CustomTestComponent.__deltemplate_s99_4e91280b = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('ComponentElement'), 'CustomTestComponent', true)(soy.$$augmentMap(opt_data, {elementContent: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + Templates.CustomTestComponent.content(opt_data, null, opt_ijData))}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.CustomTestComponent.__deltemplate_s99_4e91280b.soyTemplateName = 'Templates.CustomTestComponent.__deltemplate_s99_4e91280b';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentTemplate'), 'CustomTestComponent', 0, Templates.CustomTestComponent.__deltemplate_s99_4e91280b);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.CustomTestComponent.__deltemplate_s103_05e27e73 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('CustomTestComponent'), 'element', true)(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.CustomTestComponent.__deltemplate_s103_05e27e73.soyTemplateName = 'Templates.CustomTestComponent.__deltemplate_s103_05e27e73';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentElement'), 'CustomTestComponent', 0, Templates.CustomTestComponent.__deltemplate_s103_05e27e73);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.CustomTestComponent.__deltemplate_s105_d413db05 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<div id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '-header">' + soy.$$escapeHtml(opt_data.elementContent) + '</div>');
};
if (goog.DEBUG) {
  Templates.CustomTestComponent.__deltemplate_s105_d413db05.soyTemplateName = 'Templates.CustomTestComponent.__deltemplate_s105_d413db05';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('CustomTestComponent.header'), 'element', 0, Templates.CustomTestComponent.__deltemplate_s105_d413db05);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.CustomTestComponent.__deltemplate_s111_36760565 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('CustomTestComponent.header'), 'element', true)(soy.$$augmentMap(opt_data, {elementContent: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + ((! opt_ijData.skipSurfaceContents) ? soy.$$getDelegateFn(soy.$$getDelTemplateId('Surface'), '', true)({content: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + Templates.CustomTestComponent.header(opt_data, null, opt_ijData)), id: opt_data.id + '-header'}, null, opt_ijData) : ''))}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.CustomTestComponent.__deltemplate_s111_36760565.soyTemplateName = 'Templates.CustomTestComponent.__deltemplate_s111_36760565';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('CustomTestComponent.header'), '', 0, Templates.CustomTestComponent.__deltemplate_s111_36760565);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.CustomTestComponent.__deltemplate_s120_b1bd47d7 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<div id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '-footer">' + soy.$$escapeHtml(opt_data.elementContent) + '</div>');
};
if (goog.DEBUG) {
  Templates.CustomTestComponent.__deltemplate_s120_b1bd47d7.soyTemplateName = 'Templates.CustomTestComponent.__deltemplate_s120_b1bd47d7';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('CustomTestComponent.footer'), 'element', 0, Templates.CustomTestComponent.__deltemplate_s120_b1bd47d7);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.CustomTestComponent.__deltemplate_s126_16e9baf4 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('CustomTestComponent.footer'), 'element', true)(soy.$$augmentMap(opt_data, {elementContent: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + ((! opt_ijData.skipSurfaceContents) ? soy.$$getDelegateFn(soy.$$getDelTemplateId('Surface'), '', true)({content: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + Templates.CustomTestComponent.footer(opt_data, null, opt_ijData)), id: opt_data.id + '-footer'}, null, opt_ijData) : ''))}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.CustomTestComponent.__deltemplate_s126_16e9baf4.soyTemplateName = 'Templates.CustomTestComponent.__deltemplate_s126_16e9baf4';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('CustomTestComponent.footer'), '', 0, Templates.CustomTestComponent.__deltemplate_s126_16e9baf4);

Templates.CustomTestComponent.header.params = ["headerContent"];
Templates.CustomTestComponent.footer.params = ["footerContent"];
/* jshint ignore:end */
