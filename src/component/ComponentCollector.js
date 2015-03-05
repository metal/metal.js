'use strict';

import dom from '../dom/dom';
import object from '../object/object';
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
     * Holds the main extracted components (that is, components that are
     * not children of other extracted components), indexed by ref.
     * @type {!Object<string, !Component>}
     * @protected
     */
    this.mainComponents_ = {};
  }

  /**
   * Creates a child component and renders it inside the specified parent.
   * @param {string} ref The component ref.
   * @param {string} name The component name.
   * @param {!Object} data The component config data.
   * @param {Element} parent The component's parent element.
   * @protected
   */
  createComponent_(ref, name, data, parent) {
    var ConstructorFn = ComponentRegistry.getConstructor(name);
    this.components_[ref] = new ConstructorFn(data).render(parent.parentNode, parent);
    this.mainComponents_[ref] = this.components_[ref];
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
   * Gets all the main extracted components.
   * @return {!Array<!Component>}
   */
  getMainComponents() {
    return this.mainComponents_;
  }

  /**
   * Handles the child component with the given ref, creating it for the first
   * time or updating it in case it doesn't exist yet.
   * @param {!Object} data The child component's template call data.
   * @return {!Component} The child component's instance.
   * @protected
   */
  extractChild_(data) {
    var component = this.components_[data.ref];
    if (component) {
      component.setAttrs(data.data);
    } else {
      var ConstructorFn = ComponentRegistry.getConstructor(data.name);
      component = new ConstructorFn(data.data);
      this.components_[data.ref] = component;
      delete this.mainComponents_[data.ref];
    }
    return component;
  }

  /**
   * Handles the given array of rendered child soy templates, converting them to
   * component instances.
   * @param {string} children Rendered children.
   * @param {string} ref The parent component's ref.
   * @param {!Object<string, !Object>} componentData An object with creation
   *   data for components that may be found inside the element, indexed by
   *   their ref strings.
   */
  extractChildren(children, parentRef, componentData) {
    var parentData = componentData[parentRef];
    parentData.data = object.mixin({}, parentData.data);
    parentData.data.children = [];

    var frag = dom.buildFragment(children);
    for (var i = 0; i < frag.childNodes.length; i++) {
      var ref = frag.childNodes[i].getAttribute('data-ref');
      var data = componentData[ref];
      if (data.children) {
        this.extractChildren(data.children.content, ref, componentData);
      }
      parentData.data.children.push(this.extractChild_(data));
    }
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
  extractComponent_(element, ref, componentData) {
    var data = componentData[ref];
    if (!data) {
      return;
    }

    if (data.children) {
      this.extractChildren(data.children.content, ref, componentData);
    }

    if (this.components_[data.ref]) {
      this.updateComponent_(data.ref, data.data, element);
    } else {
      this.createComponent_(data.ref, data.name, data.data, element);
    }
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
      this.extractComponent_(element, ref, componentData);
    }

    return componentData;
  }

  /**
   * Updates a child component's data and parent.
   * @param {string} ref The component's ref.
   * @param {!Object} data The component's data.
   * @param {Element} parent The component's parent element.
   * @protected
   */
  updateComponent_(ref, data, parent) {
    var component = this.components_[ref];
    parent.parentNode.insertBefore(component.element, parent);
    parent.parentNode.removeChild(parent);
    component.setAttrs(data);
  }
}

export default ComponentCollector;
