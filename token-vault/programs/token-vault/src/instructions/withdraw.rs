#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface,TransferChecked,transfer_checked},
};

use crate::state::*;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut, 
        associated_token::mint =mint, 
        associated_token::authority= owner,
        associated_token::token_program=token_program,
    )]
    pub owner_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(
        seeds=[b"state",owner.key().as_ref()],
        bump
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority=vault_state,
        associated_token::token_program=token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> Withdraw<'info> {
    pub fn withdraw(&mut self, amount:u64) -> Result<()> {
        let signer_seeds: [&[&[u8]]; 1] = [&[
            b"state",
            self.owner.to_account_info().key.as_ref(),
            &[self.vault_state.state_bump],
        ]];
        let transfer_accounts = TransferChecked {
            from: self.vault.to_account_info(),
            to: self.owner_ata.to_account_info(),
            mint: self.mint.to_account_info(),
            authority: self.owner.to_account_info(),
        };
        let cpi_context = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            transfer_accounts,
            &signer_seeds,
        );
        transfer_checked(cpi_context, amount, self.mint.decimals)?;
        Ok(())
    }
}
