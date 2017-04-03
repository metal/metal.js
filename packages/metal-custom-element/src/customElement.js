import State from 'metal-state';

/**
 * Register a custom element for a given metal component.
 *
 * @param {String} tagName The tag name to use for this custom element.
 * @param {!function()} Ctor Metal component constructor.
 * @return {void} Nothing.
 */
export function defineWebComponent(tagName, Ctor) {

	const observedAttrs = Object.keys(State.getStateStatic(Ctor));

	class CustomElement extends HTMLElement {
		constructor() {
			super();
		}

		static get observedAttributes() {
			return observedAttrs;
		}

		connectedCallback() {
			let shadowRoot = this.attachShadow({
				mode: 'open'
			});
			let opts = {};
			for (let i = 0, l = observedAttrs.length; i < l; i++) {
				opts[observedAttrs[i]] = this.getAttribute(observedAttrs[i]);
			}
			this.component = new Ctor(opts, shadowRoot);
			this.componentEventHandler = this.emit.bind(this);
			this.component.on('*', this.componentEventHandler);
		}

		attributeChangedCallback(attrName, oldVal, newVal) {
			if (this.component) {
				this.component[attrName] = newVal;
			}
		}

		disconnectedCallback() {
			if (this.component) {
				this.component.off('*', this.componentEventHandler);
				this.component.dispose();
			}
		}

		emit(...data) {
			const evt = data.pop();
			this.dispatchEvent(new CustomEvent(evt.type, {
				detail: data
			}));
		}
	}

	window.customElements.define(tagName, CustomElement);
}
