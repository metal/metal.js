'use strict';

import {isServerSide} from 'metal';
import Component from 'metal-component';
import Soy from 'metal-soy';

import templates from './Footer.soy.js';

class Footer extends Component {
	attached() {
		if (isServerSide()) {
			return;
		}
		this.year = new Date().getFullYear();
	}

};

Soy.register(Footer, templates);

export default Footer;
