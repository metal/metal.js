import Component from 'metal-component';
import Soy from 'metal-soy';
import './ChildComponent.soy.js';

import templates from './ParentComponent.soy.js';

class ParentComponent extends Component {
}

ParentComponent.STATE = {
	message: {}
};

Soy.register(ParentComponent, templates);

export default ParentComponent;
