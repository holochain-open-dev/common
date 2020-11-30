import { Resolvers } from '@apollo/client/core';
import { AppWebsocket, CellId, InstalledAppId } from '@holochain/conductor-api';
import { Membrane } from '../types';
import { deserializeHash, serializeHash } from '../utils';
import * as msgpack from '@msgpack/msgpack';

export async function getCellIdForDnaHash(
  appWebsocket: AppWebsocket,
  installedAppId: InstalledAppId,
  dnaHash: string
): Promise<CellId> {
  const appInfo = await appWebsocket.appInfo({
    installed_app_id: installedAppId,
  });

  const cell = appInfo.cell_data.find(
    cellData => serializeHash(cellData[0][0]) === dnaHash
  );

  if (!cell) throw new Error(`Could not find cell for dna ${dnaHash}`);

  return cell[0];
}

export function commonResolvers(
  appWebsocket: AppWebsocket,
  installedAppId: InstalledAppId,
  zomeName = 'common'
): Resolvers {
  async function callZome(dnaHash: string, fn_name: string, payload: any) {
    const cellId = await getCellIdForDnaHash(
      appWebsocket,
      installedAppId,
      dnaHash
    );
    return appWebsocket.callZome({
      cap: null as any,
      cell_id: cellId,
      zome_name: zomeName,
      fn_name: fn_name,
      payload: payload,
      provenance: cellId[1],
    });
  }
  return {
    Query: {
      async me() {
        const appInfo = await appWebsocket.appInfo({
          installed_app_id: installedAppId,
        });

        const myAgentPubKey = appInfo.cell_data[0][0][1];

        return {
          id: serializeHash(myAgentPubKey),
        };
      },
    },
    CommonMembrane: {
      async get(commonMembrane, { entryId }) {
        const entryDetails = await callZome(
          commonMembrane.id,
          'get_entry_details',
          entryId
        );

        if (!entryDetails)
          throw new Error(`Entry with ID ${entryId} not found`);
        const entry: any = msgpack.decode(entryDetails.entry.entry);

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
