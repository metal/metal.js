---
title: "Tutorial: Modal - Nested Components"
description: ""
layout: "progress"
weight: 400
---

<article>

In the [previous section](/docs/getting-started/modal_updates.html) we finished
working on our component's behavior.

But what if our **Modal** header's markup was very similar to one that is used
in other places though? Ideally we'd move it into a separate component that
can be reused. That's what we'll be doing in this section.

</article>

<article id="creating_closeheader">

## [Creating **CloseHeader**](#creating_closeheader)

First let's create the new component. Add a `src/CloseHeader.js` file to
your project:


```javascript
// src/CloseHeader.js

import templates from './CloseHeader.soy';
import Component from 'metal-component';
import Soy from 'metal-soy';

class CloseHeader extends Component {
}

Soy.register(CloseHeader, templates);

export default CloseHeader;
```
```jsx
// src/CloseHeader.js

import JSXComponent from 'metal-jsx';

class CloseHeader extends JSXComponent {
    render() {
    }
}

export default CloseHeader;
```

Now let's prepare the template to be similar to the one used by **Modal**:

```soy
// src/CloseHeader.soy

&#123;namespace CloseHeader&#125;

/**
 * @param cssClass
 * @param onClick
 * @param title
 */
&#123;template .render&#125;
    <header class="{$cssClass}">
        <button onClick="{$onClick}" type="button" class="close">
            <span>×</span>
        </button>
        <h4>{$title}</h4>
    </header>
&#123;/template&#125;
```
```jsx
// src/CloseHeader.js

render() {
    return <header class={this.props.cssClass}>
        <button onClick={this.props.onClick} type="button" class="close">
            <span>×</span>
        </button>
        <h4>{this.props.title}</h4>
    </header>;
}
```

Done! Our new component is ready to be used by **Modal**.

</article>

<article id="using_closeheader">

## [Using **CloseHeader**](#using_closeheader)

All we have to do is to replace the header markup from **Modal**'s template
with a call to **CloseHeader**:

```soy
// src/Modal.soy

/**
 * @param body
 * @param close
 * @param header
 * @param shown
 */
&#123;template .render&#125;
    <div class="modal {$shown ? 'show': ''}">
        <div class="modal-dialog">
            <div class="modal-content">
                {call CloseHeader.render}
                    {param cssClass: 'modal-header' /}
                    {param onClick: $close /}
                    {param title: $header /}
                {/call}
                <section class="modal-body">
                    {$body}
                </section>
                <footer class="modal-footer">
                    <button type="button" class="btn btn-primary">OK</button>
                </footer>
            </div>
        </div>
    </div>
&#123;/template&#125;
```
```jsx
// src/Modal.js

render() {
    var cssClass = 'modal';
    if (this.props.shown) {
        cssClass += 'show';
    }
    return <div class={cssClass}>
        <div class="modal-dialog">
            <div class="modal-content">
                <CloseHeader
                    cssClass="modal-header"
                    onClick={this.close.bind(this)}
                    title={this.props.header}
                />
                <section class="modal-body">
                    {this.props.body}
                </section>
                <footer class="modal-footer">
                    <button type="button" class="btn btn-primary">OK</button>
                </footer>
            </div>
        </div>
    </div>;
}
```

This will not only render **CloseHeader** at the right position, but also
instantiate it for you. For more details on nested components, check out the
{sp}[guide about it](/docs/guides/nested-components.html).

</article>

<article id="next_steps">

## [Next Steps](#next_steps)

Now that we have learned how to properly create a new component, it'd good to
also know how to test it. The next section will focus on that.

**[↪ Tutorial: Modal - Testing](/docs/getting-started/modal_testing.html)**

</article>