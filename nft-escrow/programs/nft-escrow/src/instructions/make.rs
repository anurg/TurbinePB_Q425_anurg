use crate::error::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{Metadata, MetadataAccount, ID as MetadataID},
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};
#[derive(Accounts)]
pub struct Make<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(mint::token_program=token_program)]
    pub nft_mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        associated_token::mint=nft_mint,
        associated_token::authority=maker,
        associated_token::token_program=token_program,
    )]
    pub maker_nft_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        payer = maker,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow",maker.key().as_ref(), maker_nft_ata.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        init_if_needed,
        payer=maker,
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

impl<'info> Make<'info> {
    pub fn make(&mut self, nft_mint: Pubkey, received: u64, bumps: &MakeBumps) -> Result<()> {
        require!(self.nft_mint.supply == 1, NFTEscrowErrors::NFTSupplyError);
        require!(
            self.nft_mint.decimals == 0,
            NFTEscrowErrors::NFTDecimalsError
        );
        //Initialize Escrow
        self.escrow.maker = self.maker.key();
        self.escrow.nft_mint = nft_mint;
        self.escrow.received = received;
        self.escrow.escrow_bump = bumps.escrow;
        //transfer nft from maker ATA to vault ATA
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = TransferChecked {
            from: self.maker_nft_ata.to_account_info(),
            mint: self.nft_mint.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.maker.to_account_info(),
        };
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
        transfer_checked(cpi_context, 1, self.nft_mint.decimals)?;
        Ok(())
    }
}
