import { getCellIdForDnaHash, serializeHash } from '../utils';
import * as msgpack from '@msgpack/msgpack';
export async function commonResolvers(appWebsocket, installedAppId, zomeName = 'common') {
    const appInfo = await appWebsocket.appInfo({
        installed_app_id: installedAppId,
    });
    async function callZome(dnaHash, fn_name, payload) {
        const cellId = getCellIdForDnaHash(appInfo, dnaHash);
        return appWebsocket.callZome({
            cap: null,
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
                // We can assume this because in a happ all public keys are the same
                const myAgentPubKey = appInfo.cell_data[0][0][1];
                return {
                    id: serializeHash(myAgentPubKey),
                };
            },
            membrane(_, { membraneId }) {
                return {
                    id: membraneId,
                };
            },
        },
        CommonMembrane: {
            async get(commonMembrane, { entryId }) {
                const entryDetails = await callZome(commonMembrane.id, 'get_entry_details', entryId);
                if (!entryDetails)
                    throw new Error(`Entry with ID ${entryId} not found`);
                const entry = msgpack.decode(entryDetails.entry.entry);
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
//# sourceMappingURL=resolvers.js.map