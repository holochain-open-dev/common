import { deserializeHash } from '../utils';
import * as msgpack from '@msgpack/msgpack';
export function commonResolvers(appWebsocket, zomeName = 'common') {
    function callZome(commonMembrane, fn_name, payload) {
        console.log(commonMembrane);
        return appWebsocket.callZome({
            cap: null,
            cell_id: [
                deserializeHash(commonMembrane.id),
                deserializeHash(commonMembrane.me.id),
            ],
            zome_name: zomeName,
            fn_name: fn_name,
            payload: payload,
            provenance: deserializeHash(commonMembrane.me.id),
        });
    }
    return {
        CommonMembrane: {
            async get(commonMembrane, { entryId }) {
                console.log('hi');
                const entryDetails = await callZome(commonMembrane, 'get_entry_details', entryId);
                console.log(entryDetails);
                if (!entryDetails)
                    throw new Error(`Entry with ID ${entryId} not found`);
                const entry = msgpack.decode(entryDetails.entry.entry);
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
//# sourceMappingURL=resolvers.js.map