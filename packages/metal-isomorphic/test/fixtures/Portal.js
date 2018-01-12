import Component from 'metal-component';
import Soy from 'metal-soy';
import './ChildComponent.soy.js';

import templates from './Portal.soy.js';

class Portal extends Component {
}

Portal.STATE = {
	message: {}
};

Soy.register(Portal, templates);

export default Portal;
