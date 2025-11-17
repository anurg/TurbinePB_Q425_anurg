import { PublicKey } from '@solana/web3.js'
import { NFTMetadata } from './nft'

// This will come from Codama generated types
// Import the generated Escrow account type
export type { Escrow } from '@/lib/generated/accounts'

// Extended escrow with additional display data
export interface EscrowWithMetadata {
  publicKey: PublicKey
  maker: PublicKey
  nftMint: PublicKey
  received: bigint
  escrowBump: number
  metadata?: NFTMetadata
}
