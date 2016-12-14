'use strict';

import { clearData, getData } from '../src/data';

describe('data', function() {
	it('should return an empty object on the first "getData" call for an object', function() {
		const obj = {};
		assert.deepEqual({}, getData(obj));
	});

	it('should return different values for different objects', function() {
		assert.notStrictEqual(getData({}), getData({}));
	});

	it('should return the same values for same object', function() {
		const obj = {};
		assert.strictEqual(getData(obj), getData(obj));
	});

	it('should keep object contents between calls', function() {
		const obj = {};
		const data = getData(obj);
		data.foo = 'foo';

		const data2 = getData(obj);
		assert.strictEqual(data, data2);
		assert.equal('foo', data2.foo);
	});

	it('should return different values for same object after "clearData"', function() {
		const obj = {};
		const data = getData(obj);
		clearData(obj);
		assert.notStrictEqual(data, getData(obj));
	});
});
