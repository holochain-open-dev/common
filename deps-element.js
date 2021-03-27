import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { BaseElement } from './base-element';
export class DepsElement extends MobxReactionUpdate(BaseElement) {
}
export function connectDeps(baseClass, deps) {
    return class extends baseClass {
        get deps() {
            return deps;
        }
    };
}
//# sourceMappingURL=deps-element.js.map