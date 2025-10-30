use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::state::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mint::token_program=token_program)]
    pub mint_a: InterfaceAccount<'info, Mint>,
    #[account(
        init_if_needed,
        payer=owner,
        associated_token::mint=mint_a,
        associated_token::authority=owner,
        associated_token::token_program=token_program
    )]
    pub owner_ata_a: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        payer=owner,
        space=8 + VaultState::INIT_SPACE,
        seeds=[b"state",owner.key().as_ref()],
        bump
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        init,
        payer=owner,
        associated_token::mint=mint_a,
        associated_token::authority=vault_state,
        associated_token::token_program=token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize_vault(&mut self) -> Result<()> {
        Ok(())
    }
}
