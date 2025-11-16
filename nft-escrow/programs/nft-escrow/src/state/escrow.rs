use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub maker: Pubkey,
    pub nft_mint: Pubkey,
    pub received: u64,
    pub escrow_bump: u8,
    pub vault_bump: u8,
}
