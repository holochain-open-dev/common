import {
  Create,
  CreateLink,
  Delete,
  DeleteLink,
  Header,
  HeaderType,
  NewEntryHeader,
  Update,
} from './header';
import { Element } from './element';
import { Entry } from './entry';

// https://github.com/holochain/holochain/blob/develop/crates/types/src/dht_op.rs

export enum DHTOpType {
  StoreElement = 'StoreElement',
  StoreEntry = 'StoreEntry',
  RegisterAgentActivity = 'RegisterAgentActivity',
  RegisterUpdatedContent = 'RegisterUpdatedContent',
  RegisterUpdatedElement = 'RegisterUpdatedElement',
  RegisterDeletedBy = 'RegisterDeletedBy',
  RegisterDeletedEntryHeader = 'RegisterDeletedEntryHeader',
  RegisterAddLink = 'RegisterAddLink',
  RegisterRemoveLink = 'RegisterRemoveLink',
}

export const DHT_SORT_PRIORITY = [
  DHTOpType.RegisterAgentActivity,
  DHTOpType.StoreEntry,
  DHTOpType.StoreElement,
  DHTOpType.RegisterUpdatedContent,
  DHTOpType.RegisterUpdatedElement,
  DHTOpType.RegisterDeletedEntryHeader,
  DHTOpType.RegisterDeletedBy,
  DHTOpType.RegisterAddLink,
  DHTOpType.RegisterRemoveLink,
];

export interface DHTOpContent<T, H> {
  type: T;
  header: H;
}

export type DHTOp =
  | (DHTOpContent<DHTOpType.StoreElement, Header> & {
      maybe_entry: Entry | undefined;
    })
  | (DHTOpContent<DHTOpType.StoreEntry, NewEntryHeader> & { entry: Entry })
  | DHTOpContent<DHTOpType.RegisterAgentActivity, Header>
  | DHTOpContent<DHTOpType.RegisterUpdatedContent, Update>
  | DHTOpContent<DHTOpType.RegisterUpdatedElement, Update>
  | DHTOpContent<DHTOpType.RegisterDeletedBy, Delete>
  | DHTOpContent<DHTOpType.RegisterDeletedEntryHeader, Delete>
  | DHTOpContent<DHTOpType.RegisterAddLink, CreateLink>
  | DHTOpContent<DHTOpType.RegisterRemoveLink, DeleteLink>;

export function elementToDHTOps(element: Element): DHTOp[] {
  const allDhtOps: DHTOp[] = [];

  // All hdk commands have these two DHT Ops

  allDhtOps.push({
    type: DHTOpType.RegisterAgentActivity,
    header: element.header,
  });
  allDhtOps.push({
    type: DHTOpType.StoreElement,
    header: element.header,
    maybe_entry: element.maybe_entry,
  });

  // Each header derives into different DHTOps

  if (element.header.type == HeaderType.Update) {
    allDhtOps.push({
      type: DHTOpType.RegisterUpdatedContent,
      header: element.header,
    });
    allDhtOps.push({
      type: DHTOpType.RegisterUpdatedElement,
      header: element.header,
    });
    allDhtOps.push({
      type: DHTOpType.StoreEntry,
      header: element.header,
      entry: element.maybe_entry as Entry,
    });
  } else if (element.header.type == HeaderType.Create) {
    allDhtOps.push({
      type: DHTOpType.StoreEntry,
      header: element.header as Create,
      entry: element.maybe_entry as Entry,
    });
  } else if (element.header.type == HeaderType.Delete) {
    allDhtOps.push({
      type: DHTOpType.RegisterDeletedBy,
      header: element.header as Delete,
    });
    allDhtOps.push({
      type: DHTOpType.RegisterDeletedEntryHeader,
      header: element.header as Delete,
    });
  } else if (element.header.type == HeaderType.DeleteLink) {
    allDhtOps.push({
      type: DHTOpType.RegisterRemoveLink,
      header: element.header as DeleteLink,
    });
  } else if (element.header.type == HeaderType.CreateLink) {
    allDhtOps.push({
      type: DHTOpType.RegisterAddLink,
      header: element.header as CreateLink,
    });
  }

  return allDhtOps;
}

export function sortDHTOps(dhtOps: DHTOp[]): DHTOp[] {
  const prio = (dhtOp: DHTOp) =>
    DHT_SORT_PRIORITY.findIndex(type => type === dhtOp.type);
  return dhtOps.sort((dhtA: DHTOp, dhtB: DHTOp) => prio(dhtA) - prio(dhtB));
}

export function getEntry(dhtOp: DHTOp): Entry | undefined {
  if (dhtOp.type === DHTOpType.StoreEntry) return dhtOp.entry;
  else if (dhtOp.type === DHTOpType.StoreElement) return dhtOp.maybe_entry;
  return undefined;
}
