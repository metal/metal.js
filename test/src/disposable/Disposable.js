'use strict';

import Disposable from '../../../src/disposable/Disposable';

describe('Disposable', function() {
	it('should correctly inform if the instance has been disposed', function() {
		var disposable = new Disposable();

		assert.ok(!disposable.isDisposed());

		disposable.dispose();
		assert.ok(disposable.isDisposed());
	});

	it('should call `disposeInternal` when running `dispose`', function() {
		class TestDisposable extends Disposable {
		}

		TestDisposable.prototype.disposeInternal = sinon.stub();

		var testDisposable = new TestDisposable();
		testDisposable.dispose();

		assert.strictEqual(1, testDisposable.disposeInternal.callCount);
	});

	it('should not dispose more than once', function() {
		class TestDisposable extends Disposable {
		}

		TestDisposable.prototype.disposeInternal = sinon.stub();

		var testDisposable = new TestDisposable();
		testDisposable.dispose();
		testDisposable.dispose();

		assert.strictEqual(1, testDisposable.disposeInternal.callCount);

	});
});
