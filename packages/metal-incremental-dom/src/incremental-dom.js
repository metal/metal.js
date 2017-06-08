import * as IncrementalDOM from 'incremental-dom';

const scope = (typeof exports !== 'undefined' && typeof global !== 'undefined') ? global : window;

scope.IncrementalDOM = scope.IncrementalDOM || IncrementalDOM;
