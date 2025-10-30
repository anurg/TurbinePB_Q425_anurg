pub use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct VaultState {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub state_bump: u8,
}
