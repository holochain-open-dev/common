import { html, LitElement } from 'lit';
import { requestContext } from './request-context';

export class SampleElement extends LitElement {
  @requestContext('count')
  count!: number;

  render() {
    return html`<span>${this.count}</span>`;
  }
}
