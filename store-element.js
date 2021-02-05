import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { BaseElement } from './base-element';
export class StoreElement extends MobxReactionUpdate(BaseElement) {
}
export function connectStore(baseClass, store) {
    return class extends baseClass {
        get store() {
            return store;
        }
    };
}
//# sourceMappingURL=store-element.js.map