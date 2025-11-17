import { PublicKey } from '@solana/web3.js'

export interface NFTMetadata {
  mint: PublicKey
  name: string
  symbol: string
  uri: string
  image?: string
  description?: string
  attributes?: Array<{
    trait_type: string
    value: string
  }>
}

export interface NFTAccount {
  mint: PublicKey
  owner: PublicKey
  amount: bigint
  metadata?: NFTMetadata
}
