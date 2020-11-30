import { ApolloClient } from '@apollo/client/core';
import { CellId } from '@holochain/conductor-api';
import { Base64 } from 'js-base64';

export function deserializeHash(hash: string): Uint8Array {
  return Base64.toUint8Array(hash.slice(1));
}

export function serializeHash(hash: Uint8Array): string {
  return `u${Base64.fromUint8Array(hash, true)}`;
}

/**
 * Setups the given element with the ApolloClient dependency
 * The result is ready to call customElements.define()
 */
export function setupApolloClientElement(
  element: any,
  apolloClient: ApolloClient<any>
): typeof HTMLElement {
  return (class extends element {
    get _apolloClient() {
      return apolloClient;
    }
  } as any) as typeof HTMLElement;
}
