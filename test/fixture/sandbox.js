'use strict';

global.lfr = {};
global.window = {};

require('../../src/lfr.js');
require('../../src/object/object.js');
require('../../src/array/array.js');
require('../../src/string/string.js');
require('../../src/html/html.js');
require('../../src/promise/Promise.js');
require('../../src/disposable/Disposable.js');
require('../../src/structs/Trie.js');
require('../../src/structs/WildcardTrie.js');
require('../../src/events/EventHandle.js');
require('../../src/events/DomEventHandle.js');
require('../../src/events/EventHandler.js');
require('../../src/events/EventEmitter.js');
require('../../src/events/EventEmitterProxy.js');
require('../../src/dom/dom.js');
require('../../src/attribute/Attribute.js');
require('../../src/net/Transport.js');
require('../../src/net/XhrTransport.js');
require('../../src/net/WebSocketTransport.js');
require('../../src/webchannel/WebChannel.js');
require('../../src/component/Component.js');

global.window = null;
global.Event = null;
