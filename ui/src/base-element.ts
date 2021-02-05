import { Constructor, LitElement } from 'lit-element';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { Dictionary } from '@holochain-open-dev/core-types';

export class BaseElement extends ScopedElementsMixin(LitElement) {
  connectedCallback() {
    super.connectedCallback();
    for (const [tag, el] of Object.entries(this.getScopedElements())) {
      this.defineScopedElement(tag, el);
    }
  }

  getScopedElements(): Dictionary<typeof HTMLElement> {
    return {};
  }
}
