import Component from 'metal-component';
import Soy from 'metal-soy';
import './Portal.soy.js';

import templates from './PortalParent.soy.js';

class PortalParent extends Component {
}

PortalParent.STATE = {
	message: {}
};

Soy.register(PortalParent, templates);

export default PortalParent;
