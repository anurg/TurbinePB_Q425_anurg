pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("F1Cgv2dQW7voUu2nwCvbr17TVgPquwgZx7iARdPq85jk");

#[program]
pub mod nft_escrow {

    use super::*;

    pub fn make(ctx: Context<Make>, nft_mint: Pubkey, received: u64) -> Result<()> {
        ctx.accounts.make(nft_mint, received, &ctx.bumps)
    }
    pub fn refund(ctx: Context<Refund>, nft_mint: Pubkey) -> Result<()> {
        ctx.accounts.refund(nft_mint)
    }
    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.take()
    }
}
