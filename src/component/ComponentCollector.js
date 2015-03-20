'use strict';

import core from '../core';
import dom from '../dom/dom';
import ComponentRegistry from '../component/ComponentRegistry';
import Disposable from '../disposable/Disposable';

class ComponentCollector extends Disposable {
  constructor() {
    super();
  }

  /**
   * Creates the appropriate component from the given config data if it doesn't
   * exist yet, or updates an existing instance with the new attributes.
   * @param {string} componentName The name of the component to be extracted.
   * @param {!Object} data The component's config data.
   * @return {!Component} The extracted component instance.
   */
  createOrUpdateComponent(componentName, data) {
    var component = ComponentCollector.components[data.id];
    if (component) {
      component.setAttrs(data);
    } else {
      var ConstructorFn = ComponentRegistry.getConstructor(componentName);
      data.element = '#' + data.id;
      component = new ConstructorFn(data);
      ComponentCollector.components[data.id] = component;
    }
    return component;
  }

  /**
   * Handles the given string of rendered templates, converting them to
   * component instances.
   * @param {string} renderedComponents Rendered components.
   * @return {!Array<!Component>}
   */
  extractComponentsFromString(renderedComponents) {
    var components = [];
    var frag = dom.buildFragment(renderedComponents);
    var ignored = false;
    for (var i = 0; i < frag.childNodes.length; i++) {
      var node = frag.childNodes[i];
      if (core.isElement(node) && node.id && ComponentCollector.components[node.id]) {
        components.push(ComponentCollector.components[node.id]);
      } else {
        ignored = true;
      }
    }

    if (ignored) {
      console.warn(
        'One or more HTML nodes were ignored when extracting components. ' +
        'Only nodes with both the id and the data-component attribute set are valid.'
      );
    }
    return components;
  }
}

/**
 * Holds all collected components, indexed by their id.
 * @type {!Object<string, !Component>}
 */
ComponentCollector.components = {};

export default ComponentCollector;
