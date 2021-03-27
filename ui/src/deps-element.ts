import { Constructor, LitElement } from 'lit-element';
import { BaseElement } from './base-element';

export abstract class DepsElement<DEPENDENCIES> extends BaseElement {
  abstract get deps(): DEPENDENCIES;
}

export type AbstractConstructor<T> = Function & { prototype: T };

export function connectDeps<DEPS, T extends AbstractConstructor<DepsElement<DEPS>>>(
  baseClass: T,
  deps: DEPS
): Constructor<HTMLElement> {
  return class extends ((baseClass as unknown) as typeof HTMLElement) {
    get deps(): DEPS {
      return deps;
    }
  };
}
