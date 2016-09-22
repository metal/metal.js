'use strict';

import * as core from './core';
import array from './array/array';
import async from './async/async';
import Disposable from './disposable/Disposable';
import object from './object/object';
import string from './string/string';

export * from './core';
export { array, async, Disposable, object, string };

// This is for backwards compatibility, making sure that old imports for the
// "core" object still work. It's best to use the named exports for each
// function instead though, since that allows bundlers like Rollup to reduce the
// bundle size by removing unused code.
export default core;
export { core };
