import { Constructor, LitElement } from 'lit-element';

export interface DepsElement<D> {
  _deps: D;
}

export type AbstractConstructor<T> = Function & { prototype: T };

export function connectDeps<
  DEPS,
  T extends AbstractConstructor<DepsElement<DEPS>>
>(baseClass: T, deps: DEPS): Constructor<HTMLElement> {
  return class extends ((baseClass as unknown) as typeof HTMLElement) {
    get _deps(): DEPS {
      return deps;
    }
  };
}
