#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("BQVCuG9QqhSHZit1erhk56sEBFMqKxjowRz8kP3CXRbb");

#[program]
pub mod token_vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.initialize_vault(&ctx.bumps)
    }
    pub fn deposit(ctx: Context<Deposit>, deposit: u64) -> Result<()> {
        ctx.accounts.deposit(deposit)
    }
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        ctx.accounts.withdraw(amount)
    }
}
