'use strict';

// This file exists just for backwards compatibility, making sure that old
// default imports for this file still work. It's best to use the named exports
// for each function instead though, since that allows bundlers like Rollup to
// reduce the bundle size by removing unused code.
import * as dom from './domNamed';

export default dom;
export {dom};
export * from './domNamed';
