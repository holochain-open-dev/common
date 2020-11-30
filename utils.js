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
//# sourceMappingURL=utils.js.map