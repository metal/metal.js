'use strict';

CodeMirror.defaults.lineNumbers = true;
CodeMirror.defaults.matchBrackets = true;
CodeMirror.defaults.theme = 'material';
CodeMirror.defaults.viewportMargin = Infinity;
CodeMirror.defaults.readOnly = true;

function handleTabClick(event) {
	var element = event.currentTarget;
	var index = parseInt(element.getAttribute('data-index'), 10);

	var tabsElement = element.parentNode.parentNode;
	var prevIndex = parseInt(tabsElement.getAttribute('data-selected'), 10) || 0;
	if (index !== prevIndex) {
		hideTab(getTabContent(prevIndex, tabsElement));
		tabsElement.querySelectorAll('.code-tab')[prevIndex].classList.remove('selected');

		tabsElement.setAttribute('data-selected', index);
		showTab(getTabContent(index, tabsElement));
		element.classList.add('selected');
	}
}

function getTabContent(index, tabsElement) {
	return tabsElement.querySelectorAll('.content > textarea')[index];
}

function hideTab(tabContent) {
	tabContent.classList.add('hidden');
	var next = tabContent.nextSibling;
	if (next && next.CodeMirror) {
		next.classList.add('hidden');
	}
}

function showTab(tabContent) {
	tabContent.classList.remove('hidden');
	var next = tabContent.nextSibling;
	if (next && next.CodeMirror) {
		next.classList.remove('hidden');
		next.CodeMirror.refresh();
	}
}

var tabs = document.querySelectorAll('.code-tab');
for (var i = 0; i < tabs.length; i++) {
	tabs[i].addEventListener('click', handleTabClick);
}

var code = document.querySelectorAll('.code');
for (var i = 0; i < code.length; i++) {
	CodeMirror.fromTextArea(code[i], {
		mode: code[i].getAttribute('data-mode') ? 'text/' + code[i].getAttribute('data-mode') : ''
	});
	if (code[i].classList.contains('hidden')) {
		code[i].nextSibling.classList.add('hidden');
	}
}
