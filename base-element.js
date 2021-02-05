import { LitElement } from 'lit-element';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { MobxReactionUpdate } from '@adobe/lit-mobx';
export class BaseElement extends MobxReactionUpdate(ScopedElementsMixin(LitElement)) {
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
export function connectStore(baseClass, store) {
    return class extends baseClass {
        get store() {
            return store;
        }
    };
}
//# sourceMappingURL=base-element.js.map