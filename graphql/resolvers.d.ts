import { Resolvers } from '@apollo/client/core';
import { AppWebsocket, InstalledAppId } from '@holochain/conductor-api';
export declare function commonResolvers(appWebsocket: AppWebsocket, installedAppId: InstalledAppId, zomeName?: string): Promise<Resolvers>;
