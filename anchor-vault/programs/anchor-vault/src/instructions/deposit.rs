use crate::state::*;
use anchor_lang::prelude::*;

#[derive(accounts)]
pub struct Deposit<'info> {}

pub fn deposit(ctx: Context<Deposit>) -> Result<()> {
    Ok(())
}
