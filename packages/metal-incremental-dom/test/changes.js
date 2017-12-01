'use strict';

import {clearChanges, getChanges, trackChanges} from '../src/changes';
import {getData} from '../src/data';
import Component from 'metal-component';

describe('changes', function() {
	let component;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
	});

	it('should track changes for a given component', function() {
		component = new Component();
		trackChanges(component);

		component.visible = false;
		const changes = getChanges(component);
		assert.deepEqual(
			{
				props: {
					visible: {
						key: 'visible',
						newVal: false,
						prevVal: true,
					},
				},
			},
			changes
		);
	});

	it('should clear changes for a given component', function() {
		component = new Component();
		trackChanges(component);

		component.visible = false;
		clearChanges(getData(component));
		assert.equal(null, getChanges(component));
	});
});
