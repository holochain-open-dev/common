import { gql } from '@apollo/client/core';

// TODO: define your own schema

export const calendarEventsTypeDefs = gql`
  type Agent {
    id: ID!
  }

  interface HolochainEntry {
    id: ID!
    _details: HolochainEntryDetails! 
  }

  type HolochainEntryDetails {
    headers: [Header!]!
    status: Status!
  }

  type Header {
    author: Agent!
    timestamp: Date!
    previous: Header
  }
`;
