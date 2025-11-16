use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{Metadata, MetadataAccount},
    token_interface::{Mint, TokenAccount, TokenInterface},
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
        init,
        payer=maker,
        associated_token::mint = nft_mint,
        associated_token::authority=escrow,
        associated_token::token_program=token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        seeds=[b"metadata",metadata_program.key().as_ref(),nft_mint.key().as_ref()],
        seeds::program=metadata_program,
        bump,
    )]
    pub metadata: Account<'info, MetadataAccount>,
    pub metadata_program: Program<'info, Metadata>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> Make<'info> {
    pub fn make(&mut self) -> Result<()> {
        //Initialize Escrow

        //transfer nft from maker ATA to vault ATA

        Ok(())
    }
}
