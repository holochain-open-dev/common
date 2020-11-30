import { gql } from '@apollo/client/core';

export const commonTypeDefs = gql`
  scalar Date

  type Agent {
    id: ID!
  }

  interface HolochainEntry {
    id: ID!
    _details: HolochainEntryDetails!
  }

  type HolochainEntryDetails {
    membrane: Membrane!
    headers: [Header!]!
  }

  type Header {
    id: ID!

    author: Agent!
    timestamp: Date!
    previous: Header
  }

  # Represents a DNA
  interface Membrane {
    id: ID!
  }

  interface CommonMembrane implements Membrane {
    id: ID!
    me: Agent!

    get(entryId: ID!): HolochainEntry!
  }
`;
