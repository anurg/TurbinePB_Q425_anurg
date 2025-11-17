import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PROGRAM_ID, METADATA_PROGRAM_ID, TOKEN_PROGRAM_ID } from './constants'

/**
 * Derives the Escrow PDA
 * Seeds: ["escrow", maker, maker_nft_ata]
 */
export function findEscrowPda(maker: PublicKey, makerNftAta: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('escrow'), maker.toBuffer(), makerNftAta.toBuffer()], PROGRAM_ID)
}

/**
 * Derives the Metaplex Metadata PDA for an NFT
 * Seeds: ["metadata", metadata_program, mint]
 */
export function findMetadataPda(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID,
  )
}

/**
 * Get the vault ATA (owned by escrow PDA)
 */
export function getVaultAddress(nftMint: PublicKey, escrow: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(
    nftMint,
    escrow,
    true, // allowOwnerOffCurve - escrow is a PDA
  )
}

/**
 * Get user's NFT Associated Token Account
 */
export function getUserNftAta(nftMint: PublicKey, owner: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(nftMint, owner, false)
}

/**
 * Get all addresses needed for escrow operations
 */
export function getEscrowAddresses(maker: PublicKey, nftMint: PublicKey) {
  const makerNftAta = getUserNftAta(nftMint, maker)
  const [escrow, escrowBump] = findEscrowPda(maker, makerNftAta)
  const vault = getVaultAddress(nftMint, escrow)
  const [metadata] = findMetadataPda(nftMint)

  return {
    makerNftAta,
    escrow,
    escrowBump,
    vault,
    metadata,
  }
}
