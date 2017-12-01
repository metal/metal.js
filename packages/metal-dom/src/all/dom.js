'use strict';

import dom from '../dom';
import domData from '../domData';
import DomEventEmitterProxy from '../DomEventEmitterProxy';
import DomEventHandle from '../DomEventHandle';
import features from '../features';
import globalEval from '../globalEval';
import globalEvalStyles from '../globalEvalStyles';
import '../events';

export * from '../dom';
export {
	domData,
	DomEventEmitterProxy,
	DomEventHandle,
	features,
	globalEval,
	globalEvalStyles,
};
export default dom;
