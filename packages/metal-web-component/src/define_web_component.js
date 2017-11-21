import State, {mergeState} from 'metal-state';
import {getStaticProperty, isObject} from 'metal';

/**
 * Register a custom element for a given Metal component.
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

	const hasProps = isObject(props) && Object.keys(props).length;

	if (hasProps) {
		observedAttributes = Object.keys(props);
	}

	/**
	 * Custom Element wrapper for Metal components.
	 *
	 * @constructor
	 * @extends HTMLElement
	 */
	function CustomElement() {
		return Reflect.construct(HTMLElement, [], CustomElement);
	}

	CustomElement.observedAttributes = observedAttributes;

	Object.setPrototypeOf(CustomElement.prototype, HTMLElement.prototype);
	Object.setPrototypeOf(CustomElement, HTMLElement);

	Object.assign(CustomElement.prototype, {
		/**
		 * Handler for when new attribute values are passed to the custom
		 * element.
		 *
		 * @memberof CustomElement
		 * @param {!string} attrName name of the changed attribute.
		 * @param {!string} oldVal previous value of the attribute.
		 * @param {!string} newVal new value of the attribute
		 */
		attributeChangedCallback: function(attrName, oldVal, newVal) {
			if (!this.component) {
				return;
			}

			newVal = this.deserializeValue_(newVal);

			if (this.componentHasProps) {
				this.component.props[attrName] = newVal;
			} else {
				this.component[attrName] = newVal;
			}
		},

		/**
		 * Handles the initial rendering of the Metal component. Invoked when
		 * the custom element enters the document.
		 *
		 * @memberof CustomElement
		 */
		connectedCallback: function() {
			const useShadowDOM = this.getAttribute('useShadowDOM') || false;
			let element = this;

			if (useShadowDOM) {
				element = this.attachShadow({
					mode: 'open',
				});
			}

			let opts = {};
			for (let i = 0, l = observedAttributes.length; i < l; i++) {
				let deserializedValue = this.deserializeValue_(
					this.getAttribute(observedAttributes[i])
				);

				if (deserializedValue) {
					opts[observedAttributes[i]] = deserializedValue;
				}
			}
			this.component = new Ctor(opts, element);
			this.componentHasProps = hasProps;
			this.componentEventHandler = this.emit.bind(this);

			this.component.on('*', this.componentEventHandler);
		},

		/**
		 * Parses attribute value as JSON in case it is an Array or Object.
		 *
		 * @memberof CustomElement
		 * @param {?} value attribute value that should be parsed.
		 * @return {Object}
		 */
		deserializeValue_: function(value) {
			let retVal;

			try {
				retVal = JSON.parse(value);
			} catch (e) {}

			return retVal || value;
		},

		/**
		 * Disposes the Metal component and detaches event listeners. Invoked
		 * once the custom element exits the document.
		 *
		 * @memberof CustomElement
		 */
		disconnectedCallback: function() {
			this.component.off('*', this.componentEventHandler);
			this.component.dispose();
		},

		/**
		 * Proxy event handler that passes event payloads from Metal component
		 * events to custom element events.
		 *
		 * @memberof CustomElement
		 * @param {?} data data emitted from Metal component event
		 */
		emit: function(...data) {
			const eventData = data.pop();
			const event = new CustomEvent(eventData.type, {
				detail: data,
			});
			this.dispatchEvent(event);
		},
	});

	window.customElements.define(tagName, CustomElement);
}

export default defineWebComponent;
