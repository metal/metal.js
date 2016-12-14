'use strict';

import dom from 'metal-dom';
import { sunset } from '../../../../test-utils';
import { captureChildren, getOwner, renderChildTree, CHILD_OWNER } from '../../src/children/children';

describe('children', function() {
	it('should capture children calls to incremental dom', function(done) {
		captureChildren({}, function(tree) {
			assert.strictEqual(1, tree.props.children.length);

			var node = tree.props.children[0];
			assert.ok(!node.text);
			assert.strictEqual('span', node.tag);
			assert.ok(node.props);
			assert.strictEqual(node.props, node.config);
			assert.strictEqual('key', node.props.key);
			assert.deepEqual('test', node.props.class);
			assert.strictEqual('bar', node.props.foo);

			assert.strictEqual(1, node.props.children.length);
			assert.strictEqual('Hello World', node.props.children[0].text);
			done();
		});

		IncrementalDOM.elementOpen('span', 'key', ['class', 'test'], 'foo', 'bar');
		IncrementalDOM.text('Hello World');
		IncrementalDOM.elementClose('span');
		IncrementalDOM.elementClose('div');
	});

	it('should return the captured tree\'s given owner object', function(done) {
		const owner = {};
		captureChildren(owner, function(tree) {
			assert.strictEqual(
				owner,
				getOwner(tree.props.children[0])
			);
			done();
		});

		IncrementalDOM.text('Hello World');
		IncrementalDOM.elementClose('div');
	});

	it('should store args for text nodes when they contain more than just the text', function(done) {
		captureChildren({}, function(tree) {
			var node = tree.props.children[0];
			assert.strictEqual('No args', node.text);
			assert.ok(!node.args);

			node = tree.props.children[1];
			assert.strictEqual('With args', node.text);
			assert.deepEqual([
				node.text,
				formatFn
			], node.args);
			done();
		});

		var formatFn = val => val;
		IncrementalDOM.text('No args');
		IncrementalDOM.text('With args', formatFn);
		IncrementalDOM.elementClose('div');
	});

	describe('renderChildTree', function() {
		let origElementOpen;

		before(function() {
			origElementOpen = IncrementalDOM.elementOpen;
			IncrementalDOM.elementOpen = function(...args) {
				args[0] = args[0].tag;
				origElementOpen.apply(null, args);
			};
		});

		after(function() {
			IncrementalDOM.elementOpen = origElementOpen;
		});

		it('should render captured children via incremental dom', function() {
			var element = document.createElement('div');

			IncrementalDOM.patch(element, () => {
				renderChildTree({
					tag: 'span',
					props: {
						children: [
							{
								args: ['Hello World'],
								text: 'Hello World'
							}
						],
						class: 'test',
						foo: 'bar',
						key: 'key'
					}
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

		it('should skip rendering children node when skipNode function returns true', function() {
			var element = document.createElement('div');

			function skipNode(node) {
				if (node.props && node.props.id === 'skip') {
					return true;
				}
			}
			IncrementalDOM.patch(element, () => {
				renderChildTree({
					tag: 'span',
					props: {
						children: [
							{
								tag: 'span',
								props: {
									id: 'beforeSkip'
								}
							},
							{
								tag: 'span',
								props: {
									id: 'skip'
								}
							},
							{
								tag: 'span',
								props: {
									id: 'afterSkip'
								}
							}
						],
						id: 'parent'
					}
				}, skipNode);
			});

			assert.strictEqual(1, element.childNodes.length);

			var child = element.childNodes[0];
			assert.strictEqual(2, child.childNodes.length);
			assert.strictEqual('beforeSkip', child.childNodes[0].id);
			assert.strictEqual('afterSkip', child.childNodes[1].id);
		});

		it('should render text nodes that have been changed after capture', function(done) {
			captureChildren({}, function(tree) {
				var element = document.createElement('div');
				tree.props.children[0].text = 'New Text';
				IncrementalDOM.patch(element, () => {
					renderChildTree(tree.props.children[0]);
				});

				assert.strictEqual(1, element.childNodes.length);
				assert.strictEqual('New Text Formatted', element.childNodes[0].textContent);
				done();
			});

			IncrementalDOM.text('Hello World', val => val + ' Formatted');
			IncrementalDOM.elementClose('div');
		});
	});

	it('should keep original renderer for children that have been recaptured by another1', function(done) {
		var renderer1 = {};
		var renderer2 = {};

		captureChildren(renderer2, function(tree) {
			var element = tree.props.children[0];
			assert.strictEqual('div', element.tag);
			assert.strictEqual(renderer2, getOwner(element));
			assert.strictEqual(1, element.props.children.length);

			element = element.props.children[0];
			assert.strictEqual('span', element.tag);
			assert.strictEqual(renderer1, getOwner(element));
			assert.strictEqual(1, element.props.children.length);

			element = element.props.children[0];
			assert.strictEqual('Hello World', element.text);
			assert.strictEqual(renderer1, getOwner(element));
			done();
		});

		IncrementalDOM.elementOpen('div');
		renderChildTree({
			tag: 'span',
			props: {
				children: [
					{
						text: 'Hello World',
						[CHILD_OWNER]: renderer1
					},
				]
			},
			[CHILD_OWNER]: renderer1
		});
		IncrementalDOM.elementClose('div');
		IncrementalDOM.elementClose('div');
	});

	describe('Sunset Tests', sunset(function() {
		it('should not have "config" object inside each child after version 3.x', function(done) {
			captureChildren({}, function(tree) {
				assert.strictEqual(1, tree.props.children.length);

				var node = tree.props.children[0];
				assert.ok(!node.config, 'Remove "config" for version 3.x');
				done();
			});

			IncrementalDOM.elementVoid('span', null, null, 'foo', 'bar');
			IncrementalDOM.elementClose('div');
		});
	}));
});
