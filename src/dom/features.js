'use strict';

import dom from '../dom/dom';

/**
 * Class with static methods responsible for doing browser feature checks.
 */
class features {
	/**
	 * Some browsers (like IE9) change the order of element attributes, when html
	 * is rendered. This method can be used to check if this behavior happens on
	 * the current browser.
	 * @return {boolean}
	 */
	static checkAttrOrderChange() {
		if (features.attrOrderChange_ === undefined) {
			var originalContent = '<div data-component="" data-ref=""></div>';
			var element = document.createElement('div');
			dom.append(element, originalContent);
			features.attrOrderChange_ = originalContent !== element.innerHTML;
		}
		return features.attrOrderChange_;
	}
}

features.attrOrderChange_ = undefined;

export default features;
