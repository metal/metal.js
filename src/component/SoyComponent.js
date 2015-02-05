'use strict';

import core from '../core';
import dom from '../dom/dom';
import object from '../object/object';
import Component from '../component/Component';

/**
 * Special Component class that handles a better integration between soy templates
 * and the components. It allows for automatic rendering of surfaces that have soy
 * templates defined with their names, skipping the call to `getSurfaceContent`.
 * @param {Object} opt_config An object with the initial values for this component's
 *   attributes.
 * @extends {Component}
 * @constructor
 */
var SoyComponent = function(opt_config) {
  SoyComponent.base(this, 'constructor', opt_config);
  core.mergeSuperClassesProperty(this.constructor, 'TEMPLATES', this.mergeTemplates_);
};
core.inherits(SoyComponent, Component);

/**
 * The soy templates for this component. Templates that have the same
 * name of a registered surface will be used for automatically rendering
 * it.
 * @type {Object<string, !function(Object):Object>}
 * @protected
 * @static
 */
SoyComponent.TEMPLATES = {};

/**
 * Overrides the default behavior so that this can automatically render
 * the appropriate soy template when one exists.
 * @param {string} surfaceId The surface id.
 * @return {Object|string} The content to be rendered.
 * @protected
 * @override
 */
SoyComponent.prototype.getSurfaceContent_ = function(surfaceId) {
  var surfaceTemplate = this.constructor.TEMPLATES_MERGED[surfaceId];
  if (core.isFunction(surfaceTemplate)) {
    return surfaceTemplate(this).content;
  } else {
    return SoyComponent.base(this, 'getSurfaceContent_', surfaceId);
  }
};

/**
 * Merges an array of values for the `TEMPLATES` property into a single object.
 * @param {!Array} values The values to be merged.
 * @return {!Object} The merged value.
 * @protected
 */
SoyComponent.prototype.mergeTemplates_ = function(values) {
  return object.mixin.apply(null, [{}].concat(values.reverse()));
};

/**
 * Overrides the behavior of this method to automatically render the element
 * template if it's defined.
 * @override
 */
SoyComponent.prototype.renderInternal = function() {
  var elementTemplate = this.constructor.TEMPLATES_MERGED.element;
  if (core.isFunction(elementTemplate)) {
    dom.append(this.element, elementTemplate(this).content);
  }
};

export default SoyComponent;
