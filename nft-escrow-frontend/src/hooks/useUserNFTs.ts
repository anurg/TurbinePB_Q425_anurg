'use client'

import { useEffect, useState } from 'react'
import { useWallet } from './useWallet'
import { useConnection } from './useConnection'
import { NFTAccount } from '@/types/nft'
import { PublicKey, Connection } from '@solana/web3.js'
import { fetchNFTsByOwner } from './nft-fetcher'
import { RPC_ENDPOINT } from '@/lib/constants'

export function useUserNFTs() {
  const wallet = useWallet()
  const [nfts, setNfts] = useState<NFTAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!wallet.publicKey) {
      setNfts([])
      return
    }

    fetchNFTs()
  }, [wallet.publicKey])

  const fetchNFTs = async () => {
    if (!wallet.publicKey) return

    setLoading(true)
    setError(null)

    try {
      const connection = new Connection(RPC_ENDPOINT)
      const ownerPubkey = new PublicKey(wallet.publicKey)

      const fetchedNFTs = await fetchNFTsByOwner(connection, ownerPubkey)

      setNfts(fetchedNFTs)
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching NFTs:', err)
      setError(err.message || 'Failed to fetch NFTs')
      setLoading(false)
    }
  }

  return {
    nfts,
    loading,
    error,
    refetch: fetchNFTs,
  }
}
