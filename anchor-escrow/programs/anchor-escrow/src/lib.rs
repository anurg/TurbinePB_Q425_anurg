#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use instructions::*;
use state::*;

declare_id!("CwreJSTjDggV8AFxQNNgctMipM5EeEwS7ZzAEsYQGAmC");

#[program]
pub mod anchor_escrow {
    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, deposit: u64, recieve: u64) -> Result<()> {
        ctx.accounts.init_escrow(seed, recieve, &ctx.bumps)?;
        ctx.accounts.deposit(deposit)
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        ctx.accounts.refund_and_close()
    }

    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.deposit()?;
        ctx.accounts.withdraw_and_close_vault()
    }
}
