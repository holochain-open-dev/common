import { ApolloClient, DocumentNode } from '@apollo/client/core';
import { AppInfoResponse, CellId } from '@holochain/conductor-api';
import { Timestamp } from './core-types/timestamp';
export declare function deserializeHash(hash: string): Uint8Array;
export declare function serializeHash(hash: Uint8Array): string;
/**
 * Setups the given element with the ApolloClient dependency
 * The result is ready to call customElements.define()
 */
export declare function setupApolloClientElement(element: any, apolloClient: ApolloClient<any>): typeof HTMLElement;
export declare function getCellIdForDnaHash(appInfo: AppInfoResponse, dnaHash: string): CellId;
export declare function clientIncludesTypeDefs(apolloClient: ApolloClient<any>, typeDefsToCheck: Array<DocumentNode>): boolean;
export declare function millisToTimestamp(millis: number): Timestamp;
export declare function timestampToMillis(timestamp: Timestamp): number;
export declare function now(): Timestamp;
