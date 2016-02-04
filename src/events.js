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
			var target = event.delegateTarget;
			if (!related || (related !== target && !target.contains(related))) {
				event.customType = eventName;
				return callback(event);
			}
		},
		originalEvent: mouseEventMap[eventName]
	});
});

var animationEventMap = {
	animation: 'animationend',
	transition: 'transitionend'
};
Object.keys(animationEventMap).forEach(function(eventType) {
	var eventName = animationEventMap[eventType];
	dom.registerCustomEvent(eventName, {
		event: true,
		delegate: true,
		handler: function(callback, event) {
			event.customType = eventName;
			return callback(event);
		},
		originalEvent: features.checkAnimationEventName()[eventType]
	});
});
