/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { ContextCallback, ContextTypeMap } from './context-event';

/**
 * A disposer function
 */
type Disposer = () => void;

/**
 * A tuple of context callback, and its disposer
 */
type CallbackRecord<T extends ContextTypeMap[keyof ContextTypeMap]> = [
  ContextCallback<T>,
  Disposer
];

/**
 * A simple class which stores a value, and triggers registered callbacks when the
 * value is changed via its setter.
 *
 * An implementor might use other observable patterns such as MobX or Redux to get
 * behavior like this. But this is a pretty minimal approach that will likely work
 * for a number of use cases.
 */
export class ContextContainer<T extends ContextTypeMap[keyof ContextTypeMap]> {
  private callbacks: Set<CallbackRecord<T>> = new Set();

  private _value!: T;
  public get value(): T {
    return this._value;
  }
  public set value(v: T) {
    this.setValue(v);
  }

  public setValue(v: T, force = false) {
    let changed = false;
    if (v !== this._value) {
      changed = true;
    }
    this._value = v;
    if (changed || force) {
      this.updateContext();
    }
  }

  constructor(defaultValue?: T) {
    if (defaultValue !== undefined) {
      this.value = defaultValue;
    }
  }

  updateContext = (): void => {
    this.callbacks.forEach(([callback, disposer]) =>
      callback(this._value, disposer)
    );
  };

  addCallback(callback: ContextCallback<T>, once?: boolean): void {
    if (!once) {
      const record: CallbackRecord<T> = [
        callback,
        () => {
          this.callbacks.delete(record);
        },
      ];
      this.callbacks.add(record);
    }
    callback(this.value);
  }
  clearCallbacks(): void {
    this.callbacks.clear();
  }
}
