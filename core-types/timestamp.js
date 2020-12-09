export function millisToTimestamp(millis) {
    const secs = Math.floor(millis / 1000);
    const nanos = (millis % 1000) * 1000;
    return [secs, nanos];
}
export function timestampToMillis(timestamp) {
    return timestamp[0] * 1000 + Math.floor(timestamp[1] / 1000);
}
export function now() {
    return millisToTimestamp(Date.now());
}
//# sourceMappingURL=timestamp.js.map