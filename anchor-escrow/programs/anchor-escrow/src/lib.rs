#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use instructions::*;
use state::*;

declare_id!("H69QtVwSDod4oLhGLwzdwju89mseVr4VbM4aUZq1hU2j");

#[program]
pub mod anchor_escrow {
    use super::*;

    pub fn initialize(ctx: Context<Make>, seed: u64, deposit: u64, recieve: u64) -> Result<()> {
        ctx.accounts.init_escrow(seed, recieve, &ctx.bumps)?;
        ctx.accounts.deposit(deposit)
    }
}
