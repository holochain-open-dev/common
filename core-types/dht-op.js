import { HeaderType, } from './header';
// https://github.com/holochain/holochain/blob/develop/crates/types/src/dht_op.rs
export var DHTOpType;
(function (DHTOpType) {
    DHTOpType["StoreElement"] = "StoreElement";
    DHTOpType["StoreEntry"] = "StoreEntry";
    DHTOpType["RegisterAgentActivity"] = "RegisterAgentActivity";
    DHTOpType["RegisterUpdatedContent"] = "RegisterUpdatedContent";
    DHTOpType["RegisterUpdatedElement"] = "RegisterUpdatedElement";
    DHTOpType["RegisterDeletedBy"] = "RegisterDeletedBy";
    DHTOpType["RegisterDeletedEntryHeader"] = "RegisterDeletedEntryHeader";
    DHTOpType["RegisterAddLink"] = "RegisterAddLink";
    DHTOpType["RegisterRemoveLink"] = "RegisterRemoveLink";
})(DHTOpType || (DHTOpType = {}));
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
export function elementToDHTOps(element) {
    const allDhtOps = [];
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
            entry: element.maybe_entry,
        });
    }
    else if (element.header.type == HeaderType.Create) {
        allDhtOps.push({
            type: DHTOpType.StoreEntry,
            header: element.header,
            entry: element.maybe_entry,
        });
    }
    else if (element.header.type == HeaderType.Delete) {
        allDhtOps.push({
            type: DHTOpType.RegisterDeletedBy,
            header: element.header,
        });
        allDhtOps.push({
            type: DHTOpType.RegisterDeletedEntryHeader,
            header: element.header,
        });
    }
    else if (element.header.type == HeaderType.DeleteLink) {
        allDhtOps.push({
            type: DHTOpType.RegisterRemoveLink,
            header: element.header,
        });
    }
    else if (element.header.type == HeaderType.CreateLink) {
        allDhtOps.push({
            type: DHTOpType.RegisterAddLink,
            header: element.header,
        });
    }
    return allDhtOps;
}
export function sortDHTOps(dhtOps) {
    const prio = (dhtOp) => DHT_SORT_PRIORITY.findIndex(type => type === dhtOp.type);
    return dhtOps.sort((dhtA, dhtB) => prio(dhtA) - prio(dhtB));
}
export function getEntry(dhtOp) {
    if (dhtOp.type === DHTOpType.StoreEntry)
        return dhtOp.entry;
    else if (dhtOp.type === DHTOpType.StoreElement)
        return dhtOp.maybe_entry;
    return undefined;
}
//# sourceMappingURL=dht-op.js.map