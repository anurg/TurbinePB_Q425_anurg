use crate::error::ErrorCode;
use crate::VaultState;
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        seeds = [b"state",user.key().as_ref()],
        bump = vault_state.state_bump
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        mut,
        seeds=[b"vault",vault_state.key().as_ref()],
        bump=vault_state.vault_bump,
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}
impl<'info> Withdraw<'info> {
    pub fn withdraw(&mut self, amount: u64) -> Result<()> {
        let rent_exempt =
            Rent::get()?.minimum_balance(self.vault_state.to_account_info().data_len());
        let min_amount = match self.vault.lamports().checked_sub(rent_exempt) {
            Some(n) => n,
            None => 0,
        };
        require!(amount <= min_amount, ErrorCode::VaultAmountError);
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.user.to_account_info(),
        };
        let seeds = &[
            b"vault".as_ref(),
            self.vault_state.to_account_info().key.as_ref(),
            &[self.vault_state.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];
        let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        transfer(cpi_context, amount)?;
        Ok(())
    }
}
pub fn handler(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    ctx.accounts.withdraw(amount)
}
