if (navigator.userAgent.indexOf('MSIE') === -1) {
	var src = '/base/packages/metal-custom-element/node_modules/@webcomponents/webcomponentsjs/webcomponents-lite.js';

	var timestamp = window.__karma__.files[src];

	var script = document.createElement('script');

	document.body.appendChild(script);

	script.crossOrigin = 'anonymous';
	script.src = src + '?' + timestamp;
	script.type = 'test/javascript';
}