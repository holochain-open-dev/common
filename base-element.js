import { LitElement } from 'lit-element';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
export class BaseElement extends ScopedElementsMixin(LitElement) {
    connectedCallback() {
        super.connectedCallback();
        for (const [tag, el] of Object.entries(this.getScopedElements())) {
            this.defineScopedElement(tag, el);
        }
    }
    getScopedElements() {
        return {};
    }
}
//# sourceMappingURL=base-element.js.map