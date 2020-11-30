use hc_utils::WrappedEntryHash;
use hdk3::prelude::*;

#[hdk_entry(id = "post")]
struct Post {
    content: String,
}

entry_defs![Post::entry_def()];

#[hdk_extern]
pub fn create(_: ()) -> ExternResult<WrappedEntryHash> {
    let entry = Post {
        content: "test".into(),
    };
    create_entry(&entry)?;

    let hash = hash_entry(&entry)?;

    Ok(WrappedEntryHash(hash))
}
