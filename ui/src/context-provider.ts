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

import { ContextEvent, ContextTypeMap } from './context-event';
import { ContextContainer } from './context-container';
import { ReactiveController, ReactiveElement } from 'lit';

/**
 * A ReactiveController which can add context provider behavior to a
 * custom-element.
 *
 * This controller simply listens to the `context-request` event when
 * the host is connected to the DOM and registers the received callbacks
 * against its observable Context implementation.
 */
export class ContextProvider<T extends keyof ContextTypeMap>
  extends ContextContainer<ContextTypeMap[T]>
  implements ReactiveController {
  constructor(
    protected host: ReactiveElement,
    private name: T,
    defaultValue?: ContextTypeMap[T]
  ) {
    super(defaultValue);
    host.addController(this);
  }

  private onContextRequest = (ev: ContextEvent<keyof ContextTypeMap>): void => {

    if (ev.name !== this.name) {
      return;
    }
    ev.stopPropagation();
    this.addCallback(ev.callback, ev.once);
  };
  hostConnected(): void {
    this.host.addEventListener('context-request', this.onContextRequest);
  }
  hostDisconnected(): void {
    this.clearCallbacks();
  }
}
