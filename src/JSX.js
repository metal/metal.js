'use strict';

import './iDOMHelpers';
import IncrementalDomRenderer from 'metal-incremental-dom';

/**
 * Allows components to use JSX templates to render their contents. Usage
 * example:
 *
 * class MyComp extends Component {
 *   render() {
 *     return <div class="my-comp">Hello World</div>;
 *   }
 * }
 * MyComp.RENDERER = JSX;
 *
 * Note that this renderer is assuming that `babel-plugin-incremental-dom` is
 * being used, so it integrates well with it. If that's not the case, it's
 * possible to use just `IncrementalDomRenderer` directly with other build
 * tools, or create another renderer that integrates better with them.
 */
class JSX extends IncrementalDomRenderer {
}

export default JSX;
