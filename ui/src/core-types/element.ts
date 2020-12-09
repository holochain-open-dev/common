import { Entry } from './entry';
import { Header } from './header';

export type Element = {
  header: Header;
  maybe_entry: Entry | undefined;
};
