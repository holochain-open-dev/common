import { Resolvers } from '@apollo/client/core';
import { AppWebsocket } from '@holochain/conductor-api';
import { CommonMembrane } from '../types';
import { deserializeHash } from '../utils';
import * as msgpack from '@msgpack/msgpack';

export function commonResolvers(
  appWebsocket: AppWebsocket,
  zomeName = 'common'
): Resolvers {
  function callZome(
    commonMembrane: CommonMembrane,
    fn_name: string,
    payload: any
  ) {
    console.log(commonMembrane);
    return appWebsocket.callZome({
      cap: null as any,
      cell_id: [
        deserializeHash(commonMembrane.id) as Buffer,
        deserializeHash(commonMembrane.me.id) as Buffer,
      ],
      zome_name: zomeName,
      fn_name: fn_name,
      payload: payload,
      provenance: deserializeHash(commonMembrane.me.id) as Buffer,
    });
  }
  return {
    CommonMembrane: {
      async get(commonMembrane, { entryId }) {
        console.log('hi')
        const entryDetails = await callZome(
          commonMembrane,
          'get_entry_details',
          entryId
        );
        console.log(entryDetails);
        if (!entryDetails)
          throw new Error(`Entry with ID ${entryId} not found`);
        const entry: any = msgpack.decode(entryDetails.entry.entry);
        console.log(entry);

        return {
          id: entryId,
          ...entry,
          _details: {
            membrane: {
              id: commonMembrane.id,
            },
            headers: entryDetails.headers,
          },
        };
      },
    },
  };
}
