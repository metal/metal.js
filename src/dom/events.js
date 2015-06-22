'use strict';

import dom from './dom';
import features from './features';

var mouseEventMap = {
	mouseenter: 'mouseover',
	mouseleave: 'mouseout',
	pointerenter: 'pointerover',
	pointerleave: 'pointerout'
};
Object.keys(mouseEventMap).forEach(function(eventName) {
	dom.registerCustomEvent(eventName, {
		delegate: true,
		handler: function(callback, event) {
			var related = event.relatedTarget;
			var target = event.delegateTarget || event.target;
			if (!related || (related !== target && !target.contains(related))) {
				event.customType = eventName;
				return callback(event);
			}
		},
		originalEvent: mouseEventMap[eventName]
	});
});
