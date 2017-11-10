if (window.navigator.userAgent.indexOf('MSIE') === -1) {
	const script = document.createElement('script');

	script.crossOrigin = 'anonymous';
	script.src = '/base/packages/metal-web-component/node_modules/@webcomponents/webcomponentsjs/webcomponents-lite.js';
	script.type = 'text/javascript';

	document.body.appendChild(script);
}
