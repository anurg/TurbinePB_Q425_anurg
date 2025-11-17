use crate::error::*;
use crate::state::*;
use anchor_lang::prelude::*;

use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{Metadata, MetadataAccount, ID as MetadataID},
    token_interface::{
        close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
        TransferChecked,
    },
};
#[derive(Accounts)]
pub struct Take<'info> {
    /// CHECK: The maker doesn't need to sign - they're just receiving payment
    #[account(mut)]
    pub maker: AccountInfo<'info>,
    #[account(mut)]
    pub taker: Signer<'info>,
    #[account(mint::token_program=token_program)]
    pub nft_mint: InterfaceAccount<'info, Mint>,
    #[account(
        associated_token::mint=nft_mint,
        associated_token::authority=maker,
        associated_token::token_program=token_program,
    )]
    pub maker_nft_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer=taker,
        associated_token::mint=nft_mint,
        associated_token::authority=taker,
        associated_token::token_program=token_program,
    )]
    pub taker_nft_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        close=maker,
        seeds = [b"escrow",maker.key().as_ref(), maker_nft_ata.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority=escrow,
        associated_token::token_program=token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        seeds=[b"metadata",MetadataID.as_ref(),nft_mint.key().as_ref()],
        seeds::program=MetadataID,
        bump,
    )]
    pub metadata: Account<'info, MetadataAccount>,
    pub metadata_program: Program<'info, Metadata>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> Take<'info> {
    pub fn take(&mut self) -> Result<()> {
        require!(self.nft_mint.supply == 1, NFTEscrowErrors::NFTSupplyError);
        require!(
            self.nft_mint.decimals == 0,
            NFTEscrowErrors::NFTDecimalsError
        );
        // cpi transfer lamports from taker to maker
        let cpi_trf_context = CpiContext::new(
            self.system_program.to_account_info(),
            Transfer {
                from: self.taker.to_account_info(),
                to: self.maker.to_account_info(),
            },
        );
        transfer(cpi_trf_context, self.escrow.received)?;
        //transfer nft from vault ATA to taker ATA
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = TransferChecked {
            from: self.vault.to_account_info(),
            mint: self.nft_mint.to_account_info(),
            to: self.taker_nft_ata.to_account_info(),
            authority: self.escrow.to_account_info(),
        };
        let seeds = &[
            b"escrow",
            self.maker.to_account_info().key.as_ref(),
            self.maker_nft_ata.to_account_info().key.as_ref(),
            &[self.escrow.escrow_bump],
        ];
        let signer_seeds = &[&seeds[..]];
        let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        transfer_checked(cpi_context, 1, self.nft_mint.decimals)?;
        // Close the Vault Account
        let close_program = self.token_program.to_account_info();
        let close_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.maker.to_account_info(),
            authority: self.escrow.to_account_info(),
        };
        let close_context =
            CpiContext::new_with_signer(close_program, close_accounts, signer_seeds);
        close_account(close_context)?;
        Ok(())
    }
}
