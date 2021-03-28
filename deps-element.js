export function connectDeps(baseClass, deps) {
    return class extends baseClass {
        get _deps() {
            return deps;
        }
    };
}
//# sourceMappingURL=deps-element.js.map