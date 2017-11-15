'use strict';

import HTML2IncDom from '../../src/html/HTML2IncDom';

describe('HTML2IncDom', function() {
	it('should render html inside element via incremental dom', function() {
		let element = document.createElement('div');
		let htmlStr = '<div class="inner">Foo</div>';
		IncrementalDOM.patch(element, () => HTML2IncDom.run(htmlStr));
		assert.strictEqual(htmlStr, element.innerHTML);
	});

	it('should render link element inside its span parent via incremental dom', function() {
		let element = document.createElement('div');
		let htmlStr = '<span><a>Foo</a></span>';
		IncrementalDOM.patch(element, () => HTML2IncDom.run(htmlStr));
		assert.strictEqual(htmlStr, element.innerHTML);
	});

	it('should render escaped html inside element via incremental dom', function() {
		let element = document.createElement('div');
		IncrementalDOM.patch(element, () => HTML2IncDom.run('&#39;Foo&#39;'));
		assert.strictEqual('\'Foo\'', element.textContent);
	});

	it('should render void elements from html via incremental dom', function() {
		let element = document.createElement('div');
		let htmlStr = '<input type="text">';
		IncrementalDOM.patch(element, () => HTML2IncDom.run(htmlStr));
		assert.strictEqual(htmlStr, element.innerHTML);
	});

	it('should build function for rendering html via incremental dom', function() {
		let element = document.createElement('div');
		let htmlStr = '<div class="inner">Foo</div>';
		let fn = HTML2IncDom.buildFn(htmlStr);
		assert.strictEqual(0, element.childNodes.length);

		IncrementalDOM.patch(element, fn);
		assert.strictEqual(htmlStr, element.innerHTML);
	});

	describe('setParser', function() {
		afterEach(function() {
			HTML2IncDom.setParser(null);
		});

		it('should allow parser to be replaced by another with equivalent api', function() {
			HTML2IncDom.setParser(function(html, handlers) {
				handlers.start('div', [{name: 'class', value: 'inner'}]);
				handlers.chars('Foo-CustomParser');
				handlers.end('div');
			});

			let element = document.createElement('div');
			let htmlStr = '<div class="inner">Foo</div>';
			IncrementalDOM.patch(element, () => HTML2IncDom.run(htmlStr));
			assert.strictEqual(
				'<div class="inner">Foo-CustomParser</div>',
				element.innerHTML
			);
		});
	});
});
