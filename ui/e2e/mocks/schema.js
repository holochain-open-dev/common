import { gql } from '@apollo/client/core';
import { cellIdToCommonMembrane } from '../../dist';

export const rootTypeDef = gql`
  type TestMembrane implements CommonMembrane & Membrane {
    id: ID!
    me: Agent!

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
        return cellIdToCommonMembrane(cellId);
      },
    },
    TestEntry: {
      __isTypeOf(obj) {
        return Object.keys(obj).includes('content');
      },
    },
  };
}
