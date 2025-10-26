use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)] //This macro does not take into account Anchor Discrimitor.So need to add 8
pub struct VaultState {
    pub vault_bump: u8,
    pub state_bump: u8,
}
