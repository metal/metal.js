'use strict';

import core from '../core';
import dom from '../dom/dom';
import ComponentRegistry from '../component/ComponentRegistry';
import Disposable from '../disposable/Disposable';

class ComponentCollector extends Disposable {
  constructor() {
    super();

    /**
     * Holds the extracted components, indexed by ref.
     * @type {!Object<string, !Component>}
     * @protected
     */
    this.components_ = {};

    /**
     * Holds the root extracted components (that is, components that are
     * not children of other extracted components), indexed by ref.
     * @type {!Object<string, !Component>}
     * @protected
     */
    this.rootComponents_ = {};
  }

  /**
   * Creates a component instance.
   * @param {string} ref The component ref.
   * @param {string} name The component name.
   * @param {!Object} data The component config data.
   * @return {!Component} The created component instance.
   * @protected
   */
  createComponent_(ref, name, data) {
    var ConstructorFn = ComponentRegistry.getConstructor(name);
    this.components_[ref] = new ConstructorFn(data);
    return this.components_[ref];
  }

  /**
   * Creates a root component instance.
   * @param {string} ref The component ref.
   * @param {string} name The component name.
   * @param {!Object} data The component config data.
   * @param {Element} parent The component's parent element.
   * @protected
   */
  createRootComponent_(ref, name, data, parent) {
    this.rootComponents_[ref] = this.createComponent_(ref, name, data);
    this.rootComponents_[ref].render(parent.parentNode, parent);
    parent.parentNode.removeChild(parent);
  }

  /**
   * Gets all the extracted components.
   * @return {!Array<!Component>}
   */
  getComponents() {
    return this.components_;
  }

  /**
   * Gets all the root extracted components.
   * @return {!Array<!Component>}
   */
  getRootComponents() {
    return this.rootComponents_;
  }

  /**
   * Extracts components from the given element.
   * @param {!Element} element
   * @param {!Object<string, !Object>} componentData An object with creation
   *   data for components that may be found inside the element, indexed by
   *   their ref strings.
   * @return {!Object<string, !Object>} The original `componentData` object.
   */
  extractComponents(element, componentData) {
    if (element.hasAttribute && element.hasAttribute('data-component')) {
      var ref = element.getAttribute('data-ref');
      this.extractRootComponent_(element, ref, componentData);
    }
    return componentData;
  }

  /**
   * Extracts a component from the given element.
   * @param {!Element} element Element that represents a component that should
   *   be extracted.
   * @param {string} ref The component's ref.
   * @param {!Object<string, !Object>} componentData An object with creation
   *   data for components that may be found inside the element, indexed by
   *   their ref strings.
   * @protected
   */
  extractRootComponent_(element, ref, componentData) {
    var data = componentData[ref];
    if (!data) {
      return;
    }

    this.extractSubcomponents(data, componentData);

    if (this.components_[data.ref]) {
      this.updateRootComponent_(data.ref, data.data, element);
    } else {
      this.createRootComponent_(data.ref, data.componentName, data.data, element);
    }
  }

  /**
   * Handles the subcomponent with the given ref, creating it for the first
   * time or updating it in case it doesn't exist yet.
   * @param {!Object} data The subcomponent's template call data.
   * @param {!Object<string, !Object>} componentData An object with creation
   *   data for components that may be found inside the element, indexed by
   *   their ref strings.
   * @return {!Component} The subcomponent's instance.
   * @protected
   */
  extractSubcomponent_(data, componentData) {
    this.extractSubcomponents(data, componentData);

    var component = this.components_[data.ref];
    if (component) {
      component.setAttrs(data.data);
    } else {
      component = this.createComponent_(data.ref, data.componentName, data.data);
      delete this.rootComponents_[data.ref];
    }
    return component;
  }

  /**
   * Converts values in the given data object to arrays of components, when
   * possible.
   * @param {!Object} data The subcomponent's template call data.
   * @param {!Object<string, !Object>} componentData An object with creation
   *   data for components that may be found inside the element, indexed by
   *   their ref strings.
   */
  extractSubcomponents(data, componentData) {
    for (var key in data.data) {
      if (this.shouldExtractSubcomponents_(data.data[key])) {
        data.data[key] = this.extractSubcomponentsFromString_(data.data[key], componentData);
      }
    }
  }

  /**
   * Handles the given string of rendered templates, converting them to
   * component instances.
   * @param {string} renderedComponents Rendered components.
   * @param {!Object<string, !Object>} componentData An object with creation
   *   data for components that may be found inside the element, indexed by
   *   their ref strings.
   * @return {string|!Array<!Component>} [description]
   * @protected
   */
  extractSubcomponentsFromString_(renderedComponents, componentData) {
    var components = [];
    var frag = dom.buildFragment(renderedComponents);
    var ignored = false;
    for (var i = 0; i < frag.childNodes.length; i++) {
      var node = frag.childNodes[i];
      if (core.isElement(node) && node.getAttribute('data-ref')) {
        var ref = node.getAttribute('data-ref');
        components.push(this.extractSubcomponent_(componentData[ref], componentData));
      } else {
        ignored = true;
      }
    }

    if (components.length) {
      if (ignored) {
        console.warn(
          'One or more HTML nodes were ignored when extracting components. ' +
          'Only nodes with the data-ref attribute set are valid.'
        );
      }
      return components;
    } else {
      return renderedComponents;
    }
  }

  /**
   * Checks if the given value has sub components that should be extracted.
   * @param {*} value
   * @return {boolean}
   */
  shouldExtractSubcomponents_(value) {
    return core.isString(value) && value.indexOf('data-component') !== -1;
  }

  /**
   * Updates a root component's data and parentNode.
   * @param {string} ref The component's ref.
   * @param {!Object} data The component's data.
   * @param {Element} parent The component's parent element.
   * @protected
   */
  updateRootComponent_(ref, data, parent) {
    var component = this.components_[ref];
    parent.parentNode.insertBefore(component.element, parent);
    parent.parentNode.removeChild(parent);
    component.setAttrs(data);
  }
}

export default ComponentCollector;
