import { CellId } from '@holochain/conductor-api';
import { CommonMembrane } from './types';
export declare function deserializeHash(hash: string): Uint8Array;
export declare function serializeHash(hash: Uint8Array): string;
export declare function cellIdToCommonMembrane(cellId: CellId): CommonMembrane;
