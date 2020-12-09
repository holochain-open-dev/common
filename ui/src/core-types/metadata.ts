import { Dictionary, Hash } from './common';
import { NewEntryHeader } from './header';
import { Timestamp } from './timestamp';

// From https://github.com/holochain/holochain/blob/develop/crates/holochain/src/core/state/metadata.rs

export interface Metadata {
  // Stores an array of headers indexed by entry hash
  system_meta: Dictionary<SysMetaVal[]>;
  link_meta: Array<{ key: LinkMetaKey; value: LinkMetaVal }>;
  misc_meta: Dictionary<MiscMetaVal>;
}

export type SysMetaVal =
  | {
      NewEntry: Hash;
    }
  | {
      Update: Hash;
    }
  | {
      Delete: Hash;
    }
  | {
      Activity: Hash;
    }
  | {
      DeleteLink: Hash;
    }
  | {
      CustomPackage: Hash;
    };

export function getSysMetaValHeaderHash(
  sys_meta_val: SysMetaVal
): Hash | undefined {
  if ((sys_meta_val as { NewEntry: Hash }).NewEntry)
    return (sys_meta_val as { NewEntry: Hash }).NewEntry;
  if ((sys_meta_val as { Update: Hash }).Update)
    return (sys_meta_val as { Update: Hash }).Update;
  if ((sys_meta_val as { Delete: Hash }).Delete)
    return (sys_meta_val as { Delete: Hash }).Delete;
  if ((sys_meta_val as { Activity: Hash }).Activity)
    return (sys_meta_val as { Activity: Hash }).Activity;
  return undefined;
}

export interface LinkMetaKey {
  base: Hash;
  zome_id: number;
  tag: any;
  header_hash: Hash;
}

export interface LinkMetaVal {
  link_add_hash: Hash;
  target: Hash;
  timestamp: Timestamp;
  zome_id: number;
  tag: any;
}

export type MiscMetaVal =
  | {
      EntryStatus: EntryDhtStatus;
    }
  | 'StoreElement'
  | { ChainItem: Timestamp }
  | { ChainObserved: HighestObserved }
  | { ChainStatus: ChainStatus };

export enum ChainStatus {
  Empty,
  Valid,
  Forked,
  Invalid,
}

export interface HighestObserved {
  header_seq: number;
  hash: Hash[];
}

export enum EntryDhtStatus {
  Live,
  /// This [Entry] has no headers that have not been deleted
  Dead,
  /// This [Entry] is awaiting validation
  Pending,
  /// This [Entry] has failed validation and will not be served by the DHT
  Rejected,
  /// This [Entry] has taken too long / too many resources to validate, so we gave up
  Abandoned,
  /// **not implemented** There has been a conflict when validating this [Entry]
  Conflict,
  /// **not implemented** The author has withdrawn their publication of this element.
  Withdrawn,
  /// **not implemented** We have agreed to drop this [Entry] content from the system. Header can stay with no entry
  Purged,
}

export interface CoreEntryDetails {
  headers: NewEntryHeader[];
  links: LinkMetaVal[];
  dhtStatus: EntryDhtStatus;
}
