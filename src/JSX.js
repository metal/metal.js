'use strict';

import './iDOMHelpers';
import IncrementalDomRenderer from 'metal-incremental-dom';

/**
 * Allows components to use JSX templates to render their contents. Usage
 * example:
 *
 * class MyComp extends Component {
 *   jsx() {
 *     return <div class="my-comp">Hello World</div>;
 *   }
 * }
 * JSX.register(MyComp);
 *
 * Note that this renderer is assuming that `babel-plugin-incremental-dom` is
 * being used, so it integrates well with it. If that's not the case, it's
 * possible to use just `IncrementalDomRenderer` directly with other build
 * tools, or create another renderer that integrates better with them.
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
