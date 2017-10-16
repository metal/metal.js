describe('metal-soy-bundle', function() {
	before(function() {
		sinon.stub(console, 'warn');
	});

	after(function() {
		console.warn.restore();
	});

	it('should show warning instead of erroring when loading bundle twice', function(done) {
		assert(window.__METAL_SOY_BUNDLE_LOADED__);
		assert.equal(console.warn.callCount, 0);

		loadBundle(function() {
			assert.equal(console.warn.callCount, 1);
			assert(console.warn.calledWith('Warning: metal-soy-bundle has already been loaded. Dedupe bundle to remove this warning.'));

			done();
		});
	});
});

function loadBundle(done) {
	var script = document.createElement('script');

	script.crossOrigin = 'anonymous';
	script.onload = done;
	script.src = '/base/packages/metal-soy-bundle/build/bundle.js';
	script.type = 'text/javascript';

	document.body.appendChild(script);
}
