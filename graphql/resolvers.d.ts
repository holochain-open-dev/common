import { Resolvers } from '@apollo/client/core';
import { AppWebsocket, CellId, InstalledAppId } from '@holochain/conductor-api';
export declare function getCellIdForDnaHash(appWebsocket: AppWebsocket, installedAppId: InstalledAppId, dnaHash: string): Promise<CellId>;
export declare function commonResolvers(appWebsocket: AppWebsocket, installedAppId: InstalledAppId, zomeName?: string): Resolvers;
