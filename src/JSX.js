'use strict';

import './iDOMHelpers';
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
		this.fn_ = comp.render && comp.render.bind(comp);
	}

	/**
	 * Overrides the original method so the "children" function can be
	 * automatically rendered through jsx.
	 * @param {!Array<!{name: string, args: !Array}>} calls
	 * @return {!function()}
	 * @protected
	 * @override
	 */
	buildChildrenFn_(calls) {
		var fn = super.buildChildrenFn_(calls);
		return iDOMHelpers.jsxWrapper(fn);
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
}

export default JSX;
