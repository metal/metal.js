'use strict';

import * as dom from '../dom';
import domData from '../domData';
import DomEventEmitterProxy from '../DomEventEmitterProxy';
import DomEventHandle from '../DomEventHandle';
import features from '../features';
import globalEval from '../globalEval';
import globalEvalStyles from '../globalEvalStyles';
import '../events';

export * from '../dom';
export { domData, DomEventEmitterProxy, DomEventHandle, features, globalEval, globalEvalStyles };

// This is for backwards compatibility, making sure that old imports for the
// "dom" object still work. It's best to use the named exports for each function
// instead though, since that allows bundlers like Rollup to reduce the bundle
// size by removing unused code.
export default dom;
export { dom };
