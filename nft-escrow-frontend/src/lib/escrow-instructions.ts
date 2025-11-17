import { address as toAddress, type Address, type TransactionSigner } from '@solana/kit'
import { PublicKey } from '@solana/web3.js'

// Import Codama generated instruction builders (ASYNC versions for PDA derivation)
import { getMakeInstructionAsync, getTakeInstructionAsync, getRefundInstructionAsync } from './generated/instructions'

/**
 * Convert PublicKey to Solana Kit Address type
 */
function toSolanaAddress(pubkey: PublicKey): Address {
  return toAddress(pubkey.toBase58())
}

export interface CreateEscrowParams {
  maker: PublicKey
  makerSigner: TransactionSigner // From wallet-ui
  nftMint: PublicKey
  price: bigint // Price in lamports
}

/**
 * Build the instruction to create an escrow (make)
 * Returns Solana Kit instruction format used by Gill
 */
export async function buildMakeInstruction(params: CreateEscrowParams) {
  const { makerSigner, nftMint, price } = params

  // Use the ASYNC version which auto-derives PDAs
  const instruction = await getMakeInstructionAsync({
    maker: makerSigner,
    nftMint: toSolanaAddress(nftMint),
    nftMintArg: toSolanaAddress(nftMint),
    received: price,
  })

  return instruction
}

export interface TakeEscrowParams {
  maker: PublicKey
  taker: PublicKey
  takerSigner: TransactionSigner // From wallet-ui
  nftMint: PublicKey
}

/**
 * Build the instruction to accept an escrow (take/buy)
 * The buyer (taker) pays SOL to the seller (maker) and receives the NFT
 */
export async function buildTakeInstruction(params: TakeEscrowParams) {
  const { maker, takerSigner, nftMint } = params

  // Use the ASYNC version which auto-derives PDAs
  const instruction = await getTakeInstructionAsync({
    maker: toSolanaAddress(maker), // Seller's address (receives payment)
    taker: takerSigner, // Buyer's signer (pays and receives NFT)
    nftMint: toSolanaAddress(nftMint),
  })

  return instruction
}

export interface RefundEscrowParams {
  maker: PublicKey
  makerSigner: TransactionSigner // From wallet-ui
  nftMint: PublicKey
}

/**
 * Build the instruction to cancel an escrow (refund)
 */
export async function buildRefundInstruction(params: RefundEscrowParams) {
  const { makerSigner, nftMint } = params

  // Use the ASYNC version which auto-derives PDAs
  const instruction = await getRefundInstructionAsync({
    maker: makerSigner,
    nftMint: toSolanaAddress(nftMint),
    nftMintArg: toSolanaAddress(nftMint),
  })

  return instruction
}
