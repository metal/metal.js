var code = document.querySelectorAll('.code');

for (var i = 0; i < code.length; i++) {
	CodeMirror.fromTextArea(code[i], {
		mode: code[i].dataset.mode ? 'text/' + code[i].dataset.mode : '',
		lineNumbers: true,
		matchBrackets: true,
		indentUnit: 2,
		indentWithTabs: false,
		theme: 'dracula',
		viewportMargin: Infinity,
		readOnly: true
	});
}
