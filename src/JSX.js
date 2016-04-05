'use strict';

import { ComponentRegistry } from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

/**
 * Allows components to use JSX templates to render their contents. Usage
 * example:
 *
 * class MyComp extends Component {
 *   jsx() {
 *     <div class="my-comp">Hello World</div>;
 *   }
 * }
 * JSX.register(MyComp);
 */
class JSX extends IncrementalDomRenderer {
	/**
	 * @inheritDoc
	 */
	constructor(comp) {
		super(comp);
		this.fn_ = comp.jsx && comp.jsx.bind(comp);
	}

	/**
	 * Overrides the default method from `IncrementalDomRenderer` so the
	 * component's JSX template can be used for rendering.
	 * @override
	 */
	renderIncDom() {
		if (this.fn_) {
			this.fn_();
		} else {
			super.renderIncDom();
		}
	}

	/**
	 * Registers the given component constructor to use JSX templates.
	 * @param {!Function} componentCtor
	 */
	static register(componentCtor) {
		componentCtor.RENDERER = JSX;
		ComponentRegistry.register(componentCtor);
	}
}

export default JSX;
