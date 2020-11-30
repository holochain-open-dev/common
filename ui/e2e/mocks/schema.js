import { gql } from '@apollo/client/core';
import { serializeHash } from '../../dist';

export const rootTypeDef = gql`
  type TestMembrane implements CommonMembrane & Membrane {
    id: ID!

    get(entryId: ID!): HolochainEntry!
  }

  type Query {
    testMembrane: TestMembrane!
  }

  type Mutation {
    _: Boolean
  }

  type TestEntry implements HolochainEntry {
    id: ID!
    content: String!
    _details: HolochainEntryDetails!
  }
`;

export function rootResolvers(cellId) {
  return {
    Query: {
      testMembrane() {
        return {
          id: serializeHash(cellId[0]),
        };
      },
    },
    TestEntry: {
      __isTypeOf(obj) {
        return Object.keys(obj).includes('content');
      },
    },
  };
}
