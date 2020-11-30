import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { SchemaLink } from '@apollo/client/link/schema';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { commonTypeDefs, commonResolvers } from '../../dist';
import { rootResolvers, rootTypeDef } from './schema';

const allTypeDefs = [rootTypeDef, commonTypeDefs];

/**
 * If process.env.CONDUCTOR_URL is undefined, it will mock the backend
 * If process.env.CONDUCTOR_URL is defined, it will try to connect to holochain at that URL
 */
export async function setupApolloClient(appWebsocket) {
  const appInfo = await appWebsocket.appInfo({ installed_app_id: 'test-app' });

  const cellId = appInfo.cell_data[0][0];

  const executableSchema = makeExecutableSchema({
    typeDefs: allTypeDefs,
    resolvers: [
      rootResolvers(cellId),
      commonResolvers(appWebsocket, 'test-app'),
    ],
    inheritResolversFromInterfaces: true,
  });

  const schemaLink = new SchemaLink({ schema: executableSchema });

  return new ApolloClient({
    typeDefs: allTypeDefs,

    cache: new InMemoryCache(),
    link: schemaLink,
  });
}
