import { ApolloClient, DocumentNode } from '@apollo/client/core';
import { AppInfoResponse, CellId } from '@holochain/conductor-api';
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

export function getCellIdForDnaHash(
  appInfo: AppInfoResponse,
  dnaHash: string
): CellId {
  const cell = appInfo.cell_data.find(
    cellData => serializeHash(cellData[0][0]) === dnaHash
  );

  if (!cell) throw new Error(`Could not find cell for dna ${dnaHash}`);

  return cell[0];
}

export function clientIncludesTypeDefs(
  apolloClient: ApolloClient<any>,
  typeDefsToCheck: Array<DocumentNode>
): boolean {
  if (!Array.isArray(apolloClient.typeDefs)) return false;

  for (const typeDef of typeDefsToCheck) {
    if (!apolloClient.typeDefs.includes(typeDef as any)) return false;
  }
  return true;
}
