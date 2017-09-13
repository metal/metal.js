import State from 'metal-state';

/**
 * Register a custom element for a given metal component.
 *
 * @param {String} tagName The tag name to use for this custom element.
 * @param {!function()} Ctor Metal component constructor.
 * @return {void} Nothing.
 */
export function defineWebComponent(tagName, Ctor) {
	if (!('customElements' in window)) {
		return;
	}

	const observedAttrs = Object.keys(State.getStateStatic(Ctor));

	class CustomElement extends HTMLElement {
		static get observedAttributes() {
			return observedAttrs;
		}

		attributeChangedCallback(attrName, oldVal, newVal) {
			this.component[attrName] = newVal;
		}

		connectedCallback() {
			const useShadowDOM = this.getAttribute('useShadowDOM') || false;
			let element = this;

			if (useShadowDOM) {
				element = this.attachShadow({
					mode: 'open'
				});
			}

			let opts = {};
			for (let i = 0, l = observedAttrs.length; i < l; i++) {
				opts[observedAttrs[i]] = this.getAttribute(observedAttrs[i]);
			}
			this.component = new Ctor(opts, element);
			this.componentEventHandler = this.emit.bind(this);

			this.component.on('*', this.componentEventHandler);
		}

		disconnectedCallback() {
			this.component.off('*', this.componentEventHandler);
			this.component.dispose();
		}

		emit(...data) {
			const eventData = data.pop();
			const event = new CustomEvent(eventData.type, {
				detail: data
			});
			this.dispatchEvent(event);
		}
	}

	window.customElements.define(tagName, CustomElement);
};

export default defineWebComponent;
