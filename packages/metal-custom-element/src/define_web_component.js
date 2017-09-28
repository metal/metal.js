import State, { mergeState } from 'metal-state';
import { getStaticProperty, isObject } from 'metal';

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

	let observedAttributes = Object.keys(State.getStateStatic(Ctor));

	const props = getStaticProperty(Ctor, 'PROPS', mergeState);

	const hasProps = isObject(props);

	if (hasProps) {
		observedAttributes = Object.keys(props);
	}

	function CustomElement() {
		return Reflect.construct(HTMLElement, [], CustomElement);
	}

	CustomElement.observedAttributes = observedAttributes;

	Object.setPrototypeOf(CustomElement.prototype, HTMLElement.prototype);
	Object.setPrototypeOf(CustomElement, HTMLElement);

	Object.assign(CustomElement.prototype, {
		attributeChangedCallback: function(attrName, oldVal, newVal) {
			if (this.componentHasProps) {
				this.component.props[attrName] = newVal;
			} else {
				this.component[attrName] = newVal;
			}
		},

		connectedCallback: function() {
			const useShadowDOM = this.getAttribute('useShadowDOM') || false;
			let element = this;

			if (useShadowDOM) {
				element = this.attachShadow({
					mode: 'open'
				});
			}

			let opts = {};
			for (let i = 0, l = observedAttributes.length; i < l; i++) {
				opts[observedAttributes[i]] = this.getAttribute(observedAttributes[i]);
			}
			this.component = new Ctor(opts, element);
			this.componentHasProps = hasProps;
			this.componentEventHandler = this.emit.bind(this);

			this.component.on('*', this.componentEventHandler);
		},

		disconnectedCallback: function() {
			this.component.off('*', this.componentEventHandler);
			this.component.dispose();
		},

		emit: function(...data) {
			const eventData = data.pop();
			const event = new CustomEvent(eventData.type, {
				detail: data
			});
			this.dispatchEvent(event);
		}
	});

	window.customElements.define(tagName, CustomElement);
};

export default defineWebComponent;
