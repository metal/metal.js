'use strict';

import { registerCustomEvent } from './dom';
import features from './features';

const mouseEventMap = {
	mouseenter: 'mouseover',
	mouseleave: 'mouseout',
	pointerenter: 'pointerover',
	pointerleave: 'pointerout'
};
Object.keys(mouseEventMap).forEach(function(eventName) {
	registerCustomEvent(eventName, {
		delegate: true,
		handler: function(callback, event) {
			const related = event.relatedTarget;
			const target = event.delegateTarget;
			if (!related || (related !== target && !target.contains(related))) {
				event.customType = eventName;
				return callback(event);
			}
		},
		originalEvent: mouseEventMap[eventName]
	});
});

const animationEventMap = {
	animation: 'animationend',
	transition: 'transitionend'
};
Object.keys(animationEventMap).forEach(function(eventType) {
	const eventName = animationEventMap[eventType];
	registerCustomEvent(eventName, {
		event: true,
		delegate: true,
		handler: function(callback, event) {
			event.customType = eventName;
			return callback(event);
		},
		originalEvent: features.checkAnimationEventName()[eventType]
	});
});
