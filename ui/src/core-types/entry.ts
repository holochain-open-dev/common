import { CapClaim, ZomeCallCapGrant } from './capabilities';

export type EntryVisibility = 'Public' | 'Private';
export type AppEntryType = {
  id: string; // This is a number in holochain, but in a simulation we don't have to worry about network performance
  zome_id: number;
  visibility: EntryVisibility;
};

export type EntryType =
  | 'Agent'
  | { App: AppEntryType }
  | 'CapClaim'
  | 'CapGrant';

export function getAppEntryType(
  entryType: EntryType
): AppEntryType | undefined {
  if ((entryType as { App: AppEntryType }).App)
    return (entryType as { App: AppEntryType }).App;
  return undefined;
}

export function getEntryTypeString(entryType: EntryType): string {
  const appEntryType = getAppEntryType(entryType);
  if (appEntryType) return appEntryType.id;

  return entryType as string;
}

export interface EntryContent<E extends string, C> {
  entry_type: E;
  content: C;
}

export type Entry =
  | EntryContent<'Agent', string>
  | EntryContent<'App', any>
  | EntryContent<'CapGrant', ZomeCallCapGrant>
  | EntryContent<'CapClaim', CapClaim>;
