import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextTypeMap } from './context-event';
import { ContextProvider } from './context-provider';

export class ContextProviderElement extends LitElement {
  private localValue?: any;

  @property({ attribute: false })
  public set value(value: any) {
    this.localValue = value;
    if (this.context) {
      this.context.value = value as never;
    }
  }

  private context?: ContextProvider<never>;

  @property()
  public set name(value: string) {
    if (!this.context) {
      this.context = new ContextProvider(this, value as never);
      if (this.localValue) {
        this.context.value = this.localValue as never;
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
