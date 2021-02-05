import { Constructor, LitElement } from 'lit-element';
import { Dictionary } from '@holochain-open-dev/core-types';
declare const BaseElement_base: typeof LitElement & import("@open-wc/dedupe-mixin").Constructor<import("@open-wc/scoped-elements/types/src/types").ScopedElementsHost> & typeof import("@open-wc/scoped-elements/types/src/types").ScopedElementsHost;
export declare abstract class BaseElement<STORE> extends BaseElement_base {
    connectedCallback(): void;
    abstract get store(): STORE;
    getScopedElements(): Dictionary<Constructor<HTMLElement>>;
}
declare type AbstractConstructor<T> = Function & {
    prototype: T;
};
export declare function connectStore<S, T extends AbstractConstructor<BaseElement<S>>>(baseClass: T, store: S): Constructor<HTMLElement>;
export {};
