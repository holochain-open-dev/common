import { Constructor, LitElement } from 'lit-element';
import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { BaseElement } from './base-element';

export abstract class StoreElement<STORE> extends MobxReactionUpdate(
  BaseElement
) {
  abstract get store(): STORE;
}

type AbstractConstructor<T> = Function & { prototype: T };

export function connectStore<S, T extends AbstractConstructor<StoreElement<S>>>(
  baseClass: T,
  store: S
): Constructor<HTMLElement> {
  return class extends ((baseClass as unknown) as typeof HTMLElement) {
    get store(): S {
      return store;
    }
  };
}
