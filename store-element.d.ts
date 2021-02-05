import { Constructor } from 'lit-element';
import { BaseElement } from './base-element';
declare const StoreElement_base: typeof BaseElement;
export declare abstract class StoreElement<STORE> extends StoreElement_base {
    abstract get store(): STORE;
}
declare type AbstractConstructor<T> = Function & {
    prototype: T;
};
export declare function connectStore<S, T extends AbstractConstructor<StoreElement<S>>>(baseClass: T, store: S): Constructor<HTMLElement>;
export {};
