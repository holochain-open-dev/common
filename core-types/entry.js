export function getAppEntryType(entryType) {
    if (entryType.App)
        return entryType.App;
    return undefined;
}
export function getEntryTypeString(entryType) {
    const appEntryType = getAppEntryType(entryType);
    if (appEntryType)
        return appEntryType.id;
    return entryType;
}
//# sourceMappingURL=entry.js.map