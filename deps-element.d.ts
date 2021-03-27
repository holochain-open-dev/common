import { Constructor } from 'lit-element';
import { BaseElement } from './base-element';
export declare abstract class DepsElement<DEPENDENCIES> extends BaseElement {
    abstract get deps(): DEPENDENCIES;
}
export declare type AbstractConstructor<T> = Function & {
    prototype: T;
};
export declare function connectDeps<DEPS, T extends AbstractConstructor<DepsElement<DEPS>>>(baseClass: T, deps: DEPS): Constructor<HTMLElement>;
