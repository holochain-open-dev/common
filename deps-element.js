import { BaseElement } from './base-element';
export class DepsElement extends BaseElement {
}
export function connectDeps(baseClass, deps) {
    return class extends baseClass {
        get deps() {
            return deps;
        }
    };
}
//# sourceMappingURL=deps-element.js.map