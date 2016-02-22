'use strict';

import { array, core } from 'metal';
import { ComponentRenderer } from 'metal-component';

class IncrementalDomRenderer extends ComponentRenderer {
	/**
	 * @inheritDoc
	 */
	constructor(comp) {
		super(comp);

		core.mergeSuperClassesProperty(
			this.constructor,
			'FN_NAME',
			array.firstDefinedValue
		);
		var name = this.constructor.FN_NAME_MERGED;
		this.fn_ = comp[name] ? comp[name].bind(comp) : this[name].bind(this);
	}

	/**
	 * Builds the component's main element, returning it without any content.
	 * TODO: Need to guarantee that the element won't have children before
	 * returning. Preferrably, we should not even create the children in the first
	 * place.
	 * @return {!Element}
	 */
	buildElement() {
		var tempParent = document.createElement('div');
		IncrementalDOM.patch(tempParent, this.fn_);
		return tempParent.childNodes[0];
	}

	/**
	 * Renders the renderer's component for the first time, patching its element
	 * through the incremental dom function calls done by `renderIncDom`.
	 */
	render() {
		this.patch();
	}

	/**
	 * Calls functions from `IncrementalDOM` to build the component element's
	 * content. Can be overriden by subclasses (for integration with template
	 * engines for example).
	 */
	renderIncDom() {
		IncrementalDOM.elementVoid('div', null, ['id', this.component_.id]);
	}

	/**
	 * Patches the component's element with the incremental dom function calls
	 * done by `renderIncDom`.
	 */
	patch() {
		IncrementalDOM.patchOuter(this.component_.element, this.fn_);
	}

	/**
	 * Updates the renderer's component when attributes change, patching its
	 * element through the incremental dom function calls done by `renderIncDom`.
	 */
	update() {
		this.patch();
	}
}

IncrementalDomRenderer.FN_NAME = 'renderIncDom';

export default IncrementalDomRenderer;
