import {
  ActionCommittedSignal,
  EntryRecord,
  getHashType,
  HashType,
  HoloHashMap,
  LinkTypeForSignal,
  retype,
  ZomeClient,
} from "@holochain-open-dev/utils";
import {
  Action,
  ActionHash,
  CreateLink,
  decodeHashFromBase64,
  Delete,
  DeleteLink,
  encodeHashToBase64,
  HoloHash,
  SignedActionHashed,
  Link,
} from "@holochain/client";
import { encode } from "@msgpack/msgpack";
import { readable } from "svelte/store";
import isEqual from "lodash-es/isEqual.js";
import cloneDeep from "lodash-es/cloneDeep.js";

import { asyncReadable, AsyncReadable, AsyncStatus } from "./async-readable.js";
import { retryUntilSuccess } from "./retry-until-success.js";

export function createLinkToLink(
  createLink: SignedActionHashed<CreateLink>
): Link {
  return {
    author: createLink.hashed.content.author,
    link_type: createLink.hashed.content.link_type,
    tag: createLink.hashed.content.tag,
    target: createLink.hashed.content.target_address,
    timestamp: createLink.hashed.content.timestamp,
    zome_index: createLink.hashed.content.zome_index,
    create_link_hash: createLink.hashed.hash,
  };
}

/**
 * Keeps an up to date list of the targets for the non-deleted links for the given collection in this DHT
 * Makes requests only while it has some subscriber
 *
 * Will do so by calling the given every 4 seconds calling the given fetch function,
 * and listening to `LinkCreated` and `LinkDeleted` signals
 *
 * Useful for collections
 */
export function collectionStore<
  S extends ActionCommittedSignal<any, any> & any
>(
  client: ZomeClient<S>,
  fetchCollection: () => Promise<Link[]>,
  linkType: string
): AsyncReadable<Array<Link>> {
  return asyncReadable<Link[]>(async (set) => {
    let links: Link[];

    const maybeSet = (newLinksValue: Link[]) => {
      const orderedNewLinks = uniquifyLinks(newLinksValue).sort(
        sortLinksByTimestampAscending
      );
      if (!isEqual(orderedNewLinks, links)) {
        links = orderedNewLinks;
        set(links);
      }
    };

    const fetch = async () => {
      const nlinks = await fetchCollection();
      maybeSet(nlinks);
    };
    await fetch();
    const interval = setInterval(() => fetch(), 4000);
    const unsubs = client.onSignal((originalSignal) => {
      if (!(originalSignal as ActionCommittedSignal<any, any>).type) return;
      const signal = originalSignal as ActionCommittedSignal<any, any>;

      if (signal.type === "LinkCreated") {
        if (linkType in signal.link_type) {
          maybeSet([...links, createLinkToLink(signal.action)]);
        }
      } else if (signal.type === "LinkDeleted") {
        if (linkType in signal.link_type) {
          maybeSet(
            links.filter(
              (link) =>
                link.create_link_hash.toString() !==
                signal.create_link_action.hashed.hash.toString()
            )
          );
        }
      }
    });
    return () => {
      clearInterval(interval);
      unsubs();
    };
  });
}

export class NotFoundError extends Error {
  constructor() {
    super("NOT_FOUND");
  }
}

export class ConflictingUpdatesError extends Error {
  constructor(public conflictingUpdates: Array<EntryRecord<any>>) {
    super("CONFLICTING_UPDATES");
  }
}

/**
 * Fetches the given entry, retrying if there is a failure
 * Makes requests only the first time it is subscribed to, and will stop after it succeeds in fetching the entry
 *
 * Useful for entries that can't be updated
 */
export function immutableEntryStore<T>(
  fetch: () => Promise<EntryRecord<T> | undefined>
): AsyncReadable<EntryRecord<T>> {
  return retryUntilSuccess(async () => {
    const entry = await fetch();
    if (!entry) throw new NotFoundError();
    return entry;
  });
}

/**
 * Keeps an up to date copy of the latest version of an entry
 * Makes requests only while it has some subscriber
 *
 * Will do so by calling the given every 4 seconds calling the given fetch function,
 * and listening to `EntryUpdated` signals
 *
 * Useful for entries that can be updated
 */
export function latestVersionOfEntryStore<
  T,
  S extends ActionCommittedSignal<any, any> & any
>(
  client: ZomeClient<S>,
  fetchLatestVersion: () => Promise<EntryRecord<T> | undefined>
): AsyncReadable<EntryRecord<T>> {
  return readable<AsyncStatus<EntryRecord<T>>>({ status: "pending" }, (set) => {
    let latestVersion: EntryRecord<T> | undefined;
    const fetch = async () => {
      try {
        const nlatestVersion = await fetchLatestVersion();
        if (nlatestVersion) {
          if (
            latestVersion?.actionHash.toString() !==
            nlatestVersion?.actionHash.toString()
          ) {
            latestVersion = nlatestVersion;
            set({
              status: "complete",
              value: latestVersion,
            });
          }
        } else {
          set({
            status: "error",
            error: new NotFoundError(),
          });
        }
      } catch (e) {
        set({
          status: "error",
          error: e,
        });
      }
    };
    fetch();
    const interval = setInterval(() => fetch(), 4000);
    const unsubs = client.onSignal((originalSignal) => {
      if (!(originalSignal as ActionCommittedSignal<any, any>).type) return;
      const signal = originalSignal as ActionCommittedSignal<any, any>;

      if (
        signal.type === "EntryUpdated" &&
        latestVersion &&
        latestVersion.actionHash.toString() ===
          signal.action.hashed.content.original_action_address.toString()
      ) {
        latestVersion = new EntryRecord({
          entry: {
            Present: {
              entry_type: "App",
              entry: encode(signal.app_entry),
            },
          },
          signed_action: signal.action,
        });
        set({
          status: "complete",
          value: latestVersion,
        });
      }
    });
    return () => {
      set({ status: "pending" });
      clearInterval(interval);
      unsubs();
    };
  });
}

/**
 * Keeps an up to date list of all the revisions for an entry
 * Makes requests only while it has some subscriber
 *
 * Will do so by calling the given every 4 seconds calling the given fetch function,
 * and listening to `EntryUpdated` signals
 *
 * Useful for entries that can be updated
 */
export function allRevisionsOfEntryStore<
  T,
  S extends ActionCommittedSignal<any, any> & any
>(
  client: ZomeClient<S>,
  fetchAllRevisions: () => Promise<Array<EntryRecord<T>>>
): AsyncReadable<Array<EntryRecord<T>>> {
  return asyncReadable(async (set) => {
    let allRevisions: Array<EntryRecord<T>>;
    const fetch = async () => {
      const nAllRevisions = await fetchAllRevisions();
      if (!isEqual(allRevisions, nAllRevisions)) {
        allRevisions = nAllRevisions;
        set(allRevisions);
      }
    };
    await fetch();
    const interval = setInterval(() => fetch(), 4000);
    const unsubs = client.onSignal(async (originalSignal) => {
      if (!(originalSignal as ActionCommittedSignal<any, any>).type) return;
      const signal = originalSignal as ActionCommittedSignal<any, any>;

      if (
        signal.type === "EntryUpdated" &&
        allRevisions &&
        allRevisions.find(
          (revision) =>
            revision.actionHash.toString() ===
            signal.action.hashed.content.original_action_address.toString()
        )
      ) {
        const newRevision = new EntryRecord<T>({
          entry: {
            Present: {
              entry_type: "App",
              entry: encode(signal.app_entry),
            },
          },
          signed_action: signal.action,
        });
        allRevisions.push(newRevision);
        set(allRevisions);
      }
    });
    return () => {
      clearInterval(interval);
      unsubs();
    };
  });
}

/**
 * Keeps an up to date list of the deletes for an entry
 * Makes requests only while it has some subscriber
 *
 * Will do so by calling the given every 4 seconds calling the given fetch function,
 * and listening to `EntryDeleted` signals
 *
 * Useful for entries that can be deleted
 */
export function deletesForEntryStore<
  S extends ActionCommittedSignal<any, any> & any
>(
  client: ZomeClient<S>,
  originalActionHash: ActionHash,
  fetchDeletes: () => Promise<Array<SignedActionHashed<Delete>>>
): AsyncReadable<Array<SignedActionHashed<Delete>>> {
  return asyncReadable(async (set) => {
    let deletes: Array<SignedActionHashed<Delete>>;
    const fetch = async () => {
      const ndeletes = await fetchDeletes();
      if (!isEqual(deletes, ndeletes)) {
        deletes = ndeletes;
        set(deletes);
      }
    };
    await fetch();
    const interval = setInterval(() => fetch(), 4000);
    const unsubs = client.onSignal((originalSignal) => {
      if (!(originalSignal as ActionCommittedSignal<any, any>).type) return;
      const signal = originalSignal as ActionCommittedSignal<any, any>;

      if (
        signal.type === "EntryDeleted" &&
        signal.action.hashed.content.deletes_address.toString() ===
          originalActionHash.toString()
      ) {
        deletes = [...deletes, signal.action];
        set(deletes);
      }
    });
    return () => {
      clearInterval(interval);
      unsubs();
    };
  });
}

export const sortLinksByTimestampAscending = (linkA: Link, linkB: Link) =>
  linkA.timestamp - linkB.timestamp;
export const sortDeletedLinksByTimestampAscending = (
  linkA: [SignedActionHashed<CreateLink>, SignedActionHashed<DeleteLink>[]],
  linkB: [SignedActionHashed<CreateLink>, SignedActionHashed<DeleteLink>[]]
) => linkA[0].hashed.content.timestamp - linkB[0].hashed.content.timestamp;
export const sortActionsByTimestampAscending = (
  actionA: SignedActionHashed<any>,
  actionB: SignedActionHashed<any>
) => actionA[0].hashed.content.timestamp - actionB[0].hashed.content.timestamp;

export function uniquify<H extends HoloHash>(array: Array<H>): Array<H> {
  const strArray = array.map((h) => encodeHashToBase64(h));
  const uniqueArray = [...new Set(strArray)];
  return uniqueArray.map((h) => decodeHashFromBase64(h) as H);
}

export function uniquifyLinks(links: Array<Link>): Array<Link> {
  const map = new HoloHashMap<ActionHash, Link>();
  for (const link of links) {
    map.set(link.create_link_hash, link);
  }

  return Array.from(map.values());
}

function uniquifyActions<T extends Action>(
  actions: Array<SignedActionHashed<T>>
): Array<SignedActionHashed<T>> {
  const map = new HoloHashMap<ActionHash, SignedActionHashed<T>>();
  for (const a of actions) {
    map.set(a.hashed.hash, a);
  }

  return Array.from(map.values());
}

/**
 * Keeps an up to date list of the links for the non-deleted links in this DHT
 * Makes requests only while it has some subscriber
 *
 * Will do so by calling the given every 4 seconds calling the given fetch function,
 * and listening to `LinkCreated` and `LinkDeleted` signals
 *
 * Useful for link types
 */
export function liveLinksStore<
  BASE extends HoloHash,
  S extends ActionCommittedSignal<any, any> & any
>(
  client: ZomeClient<S>,
  baseAddress: BASE,
  fetchLinks: () => Promise<Array<Link>>,
  linkType: LinkTypeForSignal<S>
): AsyncReadable<Array<Link>> {
  let innerBaseAddress = baseAddress;
  if (getHashType(innerBaseAddress) === HashType.AGENT) {
    innerBaseAddress = retype(innerBaseAddress, HashType.ENTRY) as BASE;
  }
  return asyncReadable(async (set) => {
    let links: Link[];

    const maybeSet = (newLinksValue: Link[]) => {
      const orderedNewLinks = uniquifyLinks(newLinksValue).sort(
        sortLinksByTimestampAscending
      );
      if (!isEqual(orderedNewLinks, links)) {
        links = orderedNewLinks;
        set(links);
      }
    };
    const fetch = async () => {
      const nlinks = await fetchLinks();
      maybeSet(nlinks);
    };
    await fetch();
    const interval = setInterval(() => fetch(), 4000);
    const unsubs = client.onSignal((originalSignal) => {
      if (!(originalSignal as ActionCommittedSignal<any, any>).type) return;
      const signal = originalSignal as ActionCommittedSignal<any, any>;

      if (signal.type === "LinkCreated") {
        if (
          linkType in signal.link_type &&
          signal.action.hashed.content.base_address.toString() ===
            innerBaseAddress.toString()
        ) {
          maybeSet([...links, createLinkToLink(signal.action)]);
        }
      } else if (signal.type === "LinkDeleted") {
        if (
          linkType in signal.link_type &&
          signal.create_link_action.hashed.content.base_address.toString() ===
            innerBaseAddress.toString()
        ) {
          maybeSet(
            links.filter(
              (link) =>
                link.create_link_hash.toString() !==
                signal.create_link_action.hashed.hash.toString()
            )
          );
        }
      }
    });
    return () => {
      clearInterval(interval);
      unsubs();
    };
  });
}

/**
 * Keeps an up to date list of the targets for the deleted links in this DHT
 * Makes requests only while it has some subscriber
 *
 * Will do so by calling the given every 4 seconds calling the given fetch function,
 * and listening to `LinkDeleted` signals
 *
 * Useful for link types and collections with some form of archive retrieving functionality
 */
export function deletedLinksStore<
  BASE extends HoloHash,
  S extends ActionCommittedSignal<any, any> & any
>(
  client: ZomeClient<S>,
  baseAddress: BASE,
  fetchDeletedLinks: () => Promise<
    Array<
      [SignedActionHashed<CreateLink>, Array<SignedActionHashed<DeleteLink>>]
    >
  >,
  linkType: LinkTypeForSignal<S>
): AsyncReadable<
  Array<[SignedActionHashed<CreateLink>, Array<SignedActionHashed<DeleteLink>>]>
> {
  let innerBaseAddress = baseAddress;
  if (getHashType(innerBaseAddress) === HashType.AGENT) {
    innerBaseAddress = retype(innerBaseAddress, HashType.ENTRY) as BASE;
  }
  return asyncReadable(async (set) => {
    let deletedLinks: Array<
      [SignedActionHashed<CreateLink>, Array<SignedActionHashed<DeleteLink>>]
    >;

    const maybeSet = (
      newDeletedLinks: Array<
        [SignedActionHashed<CreateLink>, Array<SignedActionHashed<DeleteLink>>]
      >
    ) => {
      const orderedNewLinks = newDeletedLinks.sort(
        sortDeletedLinksByTimestampAscending
      );
      for (let i = 0; i < orderedNewLinks.length; i += 1) {
        orderedNewLinks[i][1] = orderedNewLinks[i][1].sort(
          sortActionsByTimestampAscending
        );
      }
      if (!isEqual(orderedNewLinks, deletedLinks)) {
        deletedLinks = orderedNewLinks;
        set(deletedLinks);
      }
    };
    const fetch = async () => {
      const ndeletedLinks = await fetchDeletedLinks();
      maybeSet(ndeletedLinks);
    };
    await fetch();
    const interval = setInterval(() => fetch(), 4000);
    const unsubs = client.onSignal((originalSignal) => {
      if (!(originalSignal as ActionCommittedSignal<any, any>).type) return;
      const signal = originalSignal as ActionCommittedSignal<any, any>;

      if (signal.type === "LinkDeleted") {
        if (
          linkType in signal.link_type &&
          signal.create_link_action.hashed.content.base_address.toString() ===
            innerBaseAddress.toString()
        ) {
          const alreadyDeletedTargetIndex = deletedLinks.findIndex(
            ([cl]) =>
              cl.hashed.hash.toString() ===
              signal.create_link_action.hashed.hash.toString()
          );

          if (alreadyDeletedTargetIndex !== -1) {
            if (
              !deletedLinks[alreadyDeletedTargetIndex][1].find(
                (dl) =>
                  dl.hashed.hash.toString() ===
                  signal.action.hashed.hash.toString()
              )
            ) {
              const clone = cloneDeep(deletedLinks);
              clone[alreadyDeletedTargetIndex][1].push(signal.action);
              maybeSet(clone);
            }
          } else {
            maybeSet([
              ...deletedLinks,
              [signal.create_link_action, [signal.action]],
            ]);
          }
        }
      }
    });
    return () => {
      clearInterval(interval);
      unsubs();
    };
  });
}