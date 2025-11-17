import { PublicKey } from '@solana/web3.js'

// Your deployed program ID
export const PROGRAM_ID = new PublicKey('GtgieiJUb3cCJ1xm7s1Vc6JU8PKe6GiGmTiA13KYcnK7')

// Metaplex Token Metadata Program
export const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

// Token Program
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

// Associated Token Program
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')

// System Program
export const SYSTEM_PROGRAM_ID = new PublicKey('11111111111111111111111111111111')

// Lamports per SOL
export const LAMPORTS_PER_SOL = 1_000_000_000

// RPC endpoint (you can override with env variable)
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com'

// Network
export const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'
