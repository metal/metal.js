import Component from 'metal-component';
import Soy from 'metal-soy';

import templates from './MyComponent.soy.js';

class MyComponent extends Component {}

MyComponent.STATE = {
	message: {
		value: '',
	},
};

Soy.register(MyComponent, templates);

export default MyComponent;
