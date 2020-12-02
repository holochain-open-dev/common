import { Base64 } from 'js-base64';
export function deserializeHash(hash) {
    return Base64.toUint8Array(hash.slice(1));
}
export function serializeHash(hash) {
    return `u${Base64.fromUint8Array(hash, true)}`;
}
/**
 * Setups the given element with the ApolloClient dependency
 * The result is ready to call customElements.define()
 */
export function setupApolloClientElement(element, apolloClient) {
    return class extends element {
        get _apolloClient() {
            return apolloClient;
        }
    };
}
export async function getCellIdForDnaHash(appWebsocket, installedAppId, dnaHash) {
    const appInfo = await appWebsocket.appInfo({
        installed_app_id: installedAppId,
    });
    const cell = appInfo.cell_data.find(cellData => serializeHash(cellData[0][0]) === dnaHash);
    if (!cell)
        throw new Error(`Could not find cell for dna ${dnaHash}`);
    return cell[0];
}
//# sourceMappingURL=utils.js.map