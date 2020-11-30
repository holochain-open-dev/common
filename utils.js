import { Base64 } from 'js-base64';
export function deserializeHash(hash) {
    return Base64.toUint8Array(hash.slice(1));
}
export function serializeHash(hash) {
    return `u${Base64.fromUint8Array(hash, true)}`;
}
export function cellIdToCommonMembrane(cellId) {
    return {
        id: serializeHash(cellId[0]),
        me: {
            id: serializeHash(cellId[1]),
        },
    };
}
//# sourceMappingURL=utils.js.map