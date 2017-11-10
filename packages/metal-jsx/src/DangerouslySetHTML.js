'use strict';

import Component from './JSXComponent';
import {Config} from 'metal-state';

/**
 * JSXComponent that renders html passed in.
 * @class
 */
class DangerouslySetHTML extends Component {
	/**
	 * @return {Component}
	 */
	render() {
		const {content, tag} = this.props;

		IncrementalDOM.elementOpen(tag, null, null);

		const node = IncrementalDOM.elementClose(tag);

		node.innerHTML = content;

		return node;
	}
}

DangerouslySetHTML.PROPS = {
	content: Config.string(),
	tag: Config.string().value('span'),
};

export default DangerouslySetHTML;
