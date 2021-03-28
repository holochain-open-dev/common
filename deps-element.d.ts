import { Constructor } from 'lit-element';
export interface DepsElement<D> {
    _deps: D;
}
export declare type AbstractConstructor<T> = Function & {
    prototype: T;
};
export declare function connectDeps<DEPS, T extends AbstractConstructor<DepsElement<DEPS>>>(baseClass: T, deps: DEPS): Constructor<HTMLElement>;
