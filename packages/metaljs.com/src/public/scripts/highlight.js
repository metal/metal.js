CodeMirror.defaults.lineNumbers = true;
CodeMirror.defaults.matchBrackets = true;
CodeMirror.defaults.theme = 'material';
CodeMirror.defaults.viewportMargin = Infinity;
CodeMirror.defaults.readOnly = true;

var code = document.querySelectorAll('.code');

for (var i = 0; i < code.length; i++) {
	CodeMirror.fromTextArea(code[i], {
		mode: code[i].dataset.mode ? 'text/' + code[i].dataset.mode : ''
	});
}
