import { LitElement } from 'lit-element';
import { Dictionary } from '@holochain-open-dev/core-types';
declare const BaseElement_base: typeof LitElement & import("@open-wc/dedupe-mixin").Constructor<import("@open-wc/scoped-elements/types/src/types").ScopedElementsHost> & typeof import("@open-wc/scoped-elements/types/src/types").ScopedElementsHost;
export declare class BaseElement extends BaseElement_base {
    connectedCallback(): void;
    getScopedElements(): Dictionary<typeof HTMLElement>;
}
export {};
