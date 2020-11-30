import { ApolloClient } from '@apollo/client/core';
export declare function deserializeHash(hash: string): Uint8Array;
export declare function serializeHash(hash: Uint8Array): string;
/**
 * Setups the given element with the ApolloClient dependency
 * The result is ready to call customElements.define()
 */
export declare function setupApolloClientElement(element: any, apolloClient: ApolloClient<any>): typeof HTMLElement;
