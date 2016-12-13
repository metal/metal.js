'use strict';

import { append } from './dom';
import { string } from 'metal';

/**
 * Class with static methods responsible for doing browser feature checks.
 */
class features {
	/**
	 * Some browsers still supports prefixed animation events. This method can
	 * be used to retrieve the current browser event name for both, animation
	 * and transition.
	 * @return {object}
	 */
	static checkAnimationEventName() {
		if (features.animationEventName_ === undefined) {
			features.animationEventName_ = {
				animation: features.checkAnimationEventName_('animation'),
				transition: features.checkAnimationEventName_('transition')
			};
		}
		return features.animationEventName_;
	}

	/**
	 * @protected
	 * @param {string} type Type to test: animation, transition.
	 * @return {string} Browser event name.
	 */
	static checkAnimationEventName_(type) {
		const prefixes = ['Webkit', 'MS', 'O', ''];
		const typeTitleCase = string.replaceInterval(type, 0, 1, type.substring(0, 1).toUpperCase());
		const suffixes = [`${typeTitleCase}End`, `${typeTitleCase}End`, `${typeTitleCase}End`, `${type}end`];
		for (let i = 0; i < prefixes.length; i++) {
			if (features.animationElement_.style[prefixes[i] + typeTitleCase] !== undefined) {
				return prefixes[i].toLowerCase() + suffixes[i];
			}
		}
		return `${type}end`;
	}

	/**
	 * Some browsers (like IE9) change the order of element attributes, when html
	 * is rendered. This method can be used to check if this behavior happens on
	 * the current browser.
	 * @return {boolean}
	 */
	static checkAttrOrderChange() {
		if (features.attrOrderChange_ === undefined) {
			const originalContent = '<div data-component="" data-ref=""></div>';
			const element = document.createElement('div');
			append(element, originalContent);
			features.attrOrderChange_ = originalContent !== element.innerHTML;
		}
		return features.attrOrderChange_;
	}
}

features.animationElement_ = document.createElement('div');
features.animationEventName_ = undefined;
features.attrOrderChange_ = undefined;

export default features;
