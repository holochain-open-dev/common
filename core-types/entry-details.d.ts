import { Entry } from './entry';
import { SignedHeaderHashed } from './header';
export interface EntryDetails {
    entry: Entry;
    headers: Array<SignedHeaderHashed>;
}
