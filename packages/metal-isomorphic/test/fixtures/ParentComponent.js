import Component from 'metal-component';
import Soy from 'metal-soy';
import './InputErrorMessage.soy.js';

import templates from './ParentComponent.soy.js';

class ParentComponent extends Component {
}

ParentComponent.STATE = {
	error: {},
	cmd: {}
};

Soy.register(ParentComponent, templates);

export default ParentComponent;
