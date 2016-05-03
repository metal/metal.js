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
}

export default JSX;
