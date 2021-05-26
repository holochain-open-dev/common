import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextTypeMap } from './context-event';
import { ContextProvider } from './context-provider';

export class ContextProviderElement<
  T extends keyof ContextTypeMap
> extends LitElement {
  private localValue?: ContextTypeMap[T];

  @property({ attribute: false })
  public set value(value: ContextTypeMap[T]) {
    this.localValue = value;
    if (this.context) {
      this.context.value = value;
    }
  }

  private context?: ContextProvider<T>;

  @property()
  public set name(value: string) {
    if (!this.context) {
      this.context = new ContextProvider(this, value as T);
      if (this.localValue) {
        this.context.value = this.localValue;
      }
    } else {
      throw new Error('Can only set context provider element name once!');
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  // Don't interfere with the html of the element tree
  static styles = css`
    :host {
      display: contents;
    }
  `;
}
