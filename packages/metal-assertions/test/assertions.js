import {
	assertBoolean,
	assertDef,
	assertDefAndNotNull,
	assertDocument,
	assertDocumentFragment,
	assertElement,
	assertFunction,
	assertNotNull,
	assertNumber,
	assertObject,
	assertString,
	assertWindow,
} from '../src/assertions';

describe('assertions', () => {
	describe('assertBoolean', () => {
		it('should throw error when it\'s not a boolean', () => {
			assert.throws(() => {
				assertBoolean(undefined, 'message');
			}, /message/);
		});

		it('should not throw error when it\'s a boolean', () => {
			assert.doesNotThrow(() => {
				assertBoolean(true, /message/);
				assertBoolean(false, /message/);
			});
		});
	});

	describe('assertDef', () => {
		it('should throw error when it\'s not defined', () => {
			assert.throws(() => {
				assertDef(undefined, 'message');
			}, /message/);
		});

		it('should not throw error when it\'s defined', () => {
			assert.doesNotThrow(() => {
				assertDef('', 'message');
			});
		});
	});

	describe('assertDefAndNotNull', () => {
		it('should throw error when it\'s not defined', () => {
			assert.throws(() => {
				assertDefAndNotNull(undefined, 'message');
			}, /message/);
		});

		it('should throw error when it\'s null', () => {
			assert.throws(() => {
				assertDefAndNotNull(null, 'message');
			}, /message/);
		});

		it('should not throw error when it\'s def and not null', () => {
			assert.doesNotThrow(() => {
				assertDefAndNotNull('', 'message');
			});
		});
	});

	describe('assertNotNull', () => {
		it('should throw error when it\'s null', () => {
			assert.throws(() => {
				assertNotNull(null, 'message');
			}, /message/);
		});

		it('should not throw error when it\'s not null', () => {
			assert.doesNotThrow(() => {
				assertNotNull(undefined, 'message');
			});
		});
	});

	describe('assertNumber', () => {
		it('should throw error when it\'s not a number', () => {
			assert.throws(() => {
				assertNumber(null, 'message');
			}, /message/);
		});

		it('should not throw error when it\'s a number', () => {
			assert.doesNotThrow(() => {
				assertNumber(3, 'message');
				assertNumber(Math.PI, 'message');
			});
		});
	});

	describe('assertFunction', () => {
		it('should throw error when it\'s not a function', () => {
			assert.throws(() => {
				assertFunction(null, 'message');
			}, /message/);
		});

		it('should not throw error when it\'s a function', () => {
			assert.doesNotThrow(() => {
				assertFunction(function() {}, /message/);
			});
		});
	});

	describe('assertObject', () => {
		it('should throw error when it\'s not an object', () => {
			assert.throws(() => {
				assertObject(null, 'message');
			}, /message/);
		});

		it('should not throw error when it\'s a object', () => {
			assert.doesNotThrow(() => {
				assertObject({}, /message/);
			});
		});
	});

	describe('assertString', () => {
		it('should throw error when it\'s not an string', () => {
			assert.throws(() => {
				assertString(null, 'message');
			}, /message/);
		});

		it('should not throw error when it\'s a string', () => {
			assert.doesNotThrow(() => {
				assertString('', 'message');
			});
		});
	});

	describe('assertDocument', () => {
		it('should throw error when it\'s not a document', () => {
			assert.throws(() => {
				assertDocument(null, 'message');
			}, /message/);
		});

		it('should not throw error when it\'s a document', () => {
			assert.doesNotThrow(() => {
				assertDocument(document, 'message');
			});
		});
	});

	describe('assertDocumentFragment', () => {
		it('should throw error when it\'s not a document fragment', () => {
			assert.throws(() => {
				assertDocumentFragment(null, 'message');
			}, /message/);
		});

		it('should not throw error when it\'s a document fragment', () => {
			assert.doesNotThrow(() => {
				assertDocumentFragment(document.createDocumentFragment(), 'message');
			});
		});
	});

	describe('assertElement', () => {
		it('should throw error when it\'s not an element', () => {
			assert.throws(() => {
				assertElement(null, 'message');
			}, /message/);
		});

		it('should not throw error when it\'s a window', () => {
			assert.doesNotThrow(() => {
				assertElement(document.createElement('div'), 'message');
			});
		});
	});

	describe('assertWindow', () => {
		it('should throw error when it\'s not a window', () => {
			assert.throws(() => {
				assertWindow(null, 'message');
			}, /message/);
		});

		it('should not throw error when it\'s a window', () => {
			assert.doesNotThrow(() => {
				assertWindow(window, 'message');
			});
		});
	});

});
