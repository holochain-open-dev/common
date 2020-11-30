import { gql } from '@apollo/client/core';
import { expect } from '@open-wc/testing';
import ConductorApi from '@holochain/conductor-api';

import { setupApolloClient } from './mocks/setupApolloClient';

describe('Apollo middleware', () => {
  it('create an entry and get its details', async function () {
    this.timeout(0);
    const appWebsocket = await ConductorApi.AppWebsocket.connect(
      process.env.CONDUCTOR_URL
    );
    const appInfo = await appWebsocket.appInfo({
      installed_app_id: 'test-app',
    });

    const cellId = appInfo.cell_data[0][0];

    const entryId = await appWebsocket.callZome({
      cap: null,
      cell_id: cellId,
      zome_name: 'test_util',
      fn_name: 'create',
      payload: null,
      provenance: cellId[1],
    });

    const client = await setupApolloClient(appWebsocket);

    const result = await client.query({
      query: gql`
        query GetEntry($entryId: ID!) {
          testMembrane {
            id
            me {
              id
            }

            get(entryId: $entryId) {
              id
              ... on TestEntry {
                content
              }
            }
          }
        }
      `,
      variables: {
        entryId,
      },
    });

    expect(result.data.testMembrane.id).to.be.ok;
    expect(result.data.testMembrane.me.id).to.be.ok;
    expect(result.data.testMembrane.get.id).to.be.ok;
    expect(result.data.testMembrane.get.content).to.equal('test');
  });
});
