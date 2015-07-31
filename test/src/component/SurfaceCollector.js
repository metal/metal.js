'use strict';

import SurfaceCollector from '../../../src/component/SurfaceCollector';

describe('SurfaceCollector', function() {
	it('should add and get surfaces', function() {
		var collector = new SurfaceCollector();
		var data1 = {};
		var data2 = {};
		collector.addSurface('surface1', data1);
		collector.addSurface('surface2', data2);
		assert.strictEqual(data1, collector.getSurface('surface1'));
		assert.strictEqual(data2, collector.getSurface('surface2'));
	});

	it('should remove surface', function() {
		var collector = new SurfaceCollector();
		collector.addSurface('surface1', {});
		collector.addSurface('surface2', {});
		collector.removeSurface('surface1');
		assert.strictEqual(null, collector.getSurface('surface1'));
		assert.notStrictEqual(null, collector.getSurface('surface2'));
	});

	it('should remove all surfaces', function() {
		var collector = new SurfaceCollector();
		collector.addSurface('surface1', {});
		collector.addSurface('surface2', {});
		collector.removeAllSurfaces();
		assert.strictEqual(null, collector.getSurface('surface1'));
		assert.strictEqual(null, collector.getSurface('surface2'));
	});

	it('should throw error if trying to add surfaces after disposed', function() {
		var collector = new SurfaceCollector();
		collector.dispose();
		assert.throws(function() {
			collector.addSurface('surface1', {});
		});
	});
});
