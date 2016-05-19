'use strict';

import dom from 'metal-dom';
import IncrementalDomChildren from '../../src/children/IncrementalDomChildren';

describe('IncrementalDomChildren', function() {
	it('should capture children calls to incremental dom"', function(done) {
		IncrementalDomChildren.capture(function(tree) {
			assert.strictEqual(1, tree.children.length);
			assert.ok(!tree.children[0].isText);
			assert.strictEqual('span', tree.children[0].args[0]);
			assert.strictEqual('key', tree.children[0].args[1]);
			assert.deepEqual(['class', 'test'], tree.children[0].args[2]);
			assert.strictEqual('foo', tree.children[0].args[3]);
			assert.strictEqual('bar', tree.children[0].args[4]);

			assert.strictEqual(1, tree.children[0].children.length);
			assert.ok(tree.children[0].children[0].isText);
			assert.strictEqual('Hello World', tree.children[0].children[0].args[0]);
			done();
		});

		IncrementalDOM.elementOpen('span', 'key', ['class', 'test'], 'foo', 'bar');
		IncrementalDOM.text('Hello World');
		IncrementalDOM.elementClose('span');
		IncrementalDOM.elementClose('div');
	});

	it('should render captured children via incremental dom"', function() {
		var element = document.createElement('div');

		IncrementalDOM.patch(element, () => {
			IncrementalDomChildren.render({
				children: [
					{
						args: ['span', 'key', ['class', 'test'], 'foo', 'bar'],
						children: [
							{
								args: ['Hello World'],
								isText: true
							}
						]
					}
				]
			});
		});

		assert.strictEqual(1, element.childNodes.length);

		var spanElement = element.childNodes[0];
		assert.strictEqual('SPAN', spanElement.tagName);
		assert.ok(dom.hasClass(spanElement, 'test'));
		assert.strictEqual('bar', spanElement.getAttribute('foo'));
		assert.strictEqual(1, spanElement.childNodes.length);
		assert.strictEqual('Hello World', spanElement.childNodes[0].textContent);
	});

	it('should skip rendering children node when skipNode function returns true"', function() {
		var element = document.createElement('div');

		function skipNode(node) {
			if (node.args && node.args[1] === 'skip') {
				return true;
			}
		}
		IncrementalDOM.patch(element, () => {
			IncrementalDomChildren.render({
				children: [
					{
						args: ['span', 'beforeSkip', ['id', 'node1']],
						children: [
							{
								args: ['Hello World'],
								isText: true
							}
						]
					},
					{
						args: ['span', 'skip', ['id', 'node2']]
					},
					{
						args: ['span', 'afterSkip', ['id', 'node3']]
					}
				]
			}, skipNode);
		});

		assert.strictEqual(2, element.childNodes.length);
		assert.strictEqual('node1', element.childNodes[0].id);
		assert.strictEqual('node3', element.childNodes[1].id);
	});
});
