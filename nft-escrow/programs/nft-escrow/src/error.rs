use anchor_lang::prelude::*;

#[error_code]
pub enum NFTEscrowErrors {
    #[msg("NFT Supply should be 1")]
    NFTSupplyError,
    #[msg("NFT Decimals should be 0")]
    NFTDecimalsError,
}
