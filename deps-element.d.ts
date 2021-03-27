import { Constructor } from 'lit-element';
import { BaseElement } from './base-element';
declare const DepsElement_base: typeof BaseElement;
export declare abstract class DepsElement<DEPENDENCIES> extends DepsElement_base {
    abstract get deps(): DEPENDENCIES;
}
export declare type AbstractConstructor<T> = Function & {
    prototype: T;
};
export declare function connectDeps<DEPS, T extends AbstractConstructor<DepsElement<DEPS>>>(baseClass: T, deps: DEPS): Constructor<HTMLElement>;
export {};
