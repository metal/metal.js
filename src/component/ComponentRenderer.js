'use strict';

/**
 * Base class that component renderers should extend from. It defines the
 * required methods all renderers should have.
 */
class ComponentRenderer {
	/**
	 * Returns the content, as a string, that should be rendered for
	 * the given component's surface.
	 * @param {!Object} surface The surface configuration.
	 * @param {!Component} component The component instance.
	 * @return {string} The content to be rendered, as a string. Nested surfaces can be
	 *   represented by placeholders in the format specified by Component.SURFACE_REGEX.
	 *   Also, if the string content's main wrapper has the surface's id, then it
	 *   will be used to render the main surface tag.
	 */
	static getSurfaceContent() {
	}

	/**
	 * Initializes the renderer for the given component. This will only be called
	 * once per component, when it's going to be rendered for the first time.
	 * @param {!Component} component The component instance.
	 */
	static init() {
	}
}

export default ComponentRenderer;
