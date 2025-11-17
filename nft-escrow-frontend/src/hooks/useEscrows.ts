'use client'

import { useEffect, useState } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { RPC_ENDPOINT, PROGRAM_ID } from '@/lib/constants'
import { EscrowWithMetadata } from '@/types/escrow'
import { fetchNFTMetadata } from './nft-fetcher' // ← Fixed import path
import { ESCROW_DISCRIMINATOR, getEscrowDecoder } from '@/lib/generated/accounts/escrow'

export function useEscrows() {
  const [escrows, setEscrows] = useState<EscrowWithMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEscrows()
  }, [])

  const fetchEscrows = async () => {
    setLoading(true)
    setError(null)

    try {
      const connection = new Connection(RPC_ENDPOINT, 'confirmed')

      // Convert Uint8Array discriminator to base58 (required by Solana RPC)
      const bs58 = await import('bs58');
      const discriminatorBase58 = bs58.default.encode(ESCROW_DISCRIMINATOR);

      // Fetch all accounts owned by the program
      const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: discriminatorBase58,
            },
          },
        ],
      })

      console.log(`Found ${accounts.length} escrow accounts`)

      // Parse escrow accounts using Codama decoder
      const decoder = getEscrowDecoder()
      const escrowsWithMetadata: EscrowWithMetadata[] = []

      for (const { pubkey, account } of accounts) {
        try {
          // Decode escrow data using Codama
          const escrowData = decoder.decode(account.data)

          // Convert addresses from Solana Kit format to Web3.js PublicKey
          const maker = new PublicKey(escrowData.maker)
          const nftMint = new PublicKey(escrowData.nftMint)

          // Fetch NFT metadata
          const metadata = await fetchNFTMetadata(connection, nftMint)

          escrowsWithMetadata.push({
            publicKey: pubkey,
            maker,
            nftMint,
            received: escrowData.received,
            escrowBump: escrowData.escrowBump,
            metadata,
          })
        } catch (err) {
          console.error(`Failed to parse escrow ${pubkey.toBase58()}:`, err)
        }
      }

      setEscrows(escrowsWithMetadata)
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching escrows:', err)
      setError(err.message || 'Failed to fetch escrows')
      setLoading(false)
    }
  }

  return {
    escrows,
    loading,
    error,
    refetch: fetchEscrows,
  }
}
