use hc_utils::{WrappedAgentPubKey, WrappedEntryHash};
use hdk3::prelude::metadata::EntryDetails;
use hdk3::prelude::*;

#[derive(Serialize, Deserialize, Clone, Debug, SerializedBytes)]
pub struct DetailsResult(Option<EntryDetails>);
#[hdk_extern]
pub fn get_entry_details(entry_hash: WrappedEntryHash) -> ExternResult<DetailsResult> {
    let details = get_details(entry_hash.0, GetOptions::default())?;

    let result = match details {
        None | Some(Details::Element(_)) => None,
        Some(Details::Entry(entry_details)) => Some(entry_details),
    };

    Ok(DetailsResult(result))
}

#[hdk_extern]
pub fn who_am_i(_: ()) -> ExternResult<WrappedAgentPubKey> {
    let agent_info = agent_info()?;

    Ok(WrappedAgentPubKey(agent_info.agent_initial_pubkey))
}