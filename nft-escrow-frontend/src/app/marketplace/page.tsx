'use client'

import { useState } from 'react'
import { useEscrows } from '@/hooks/useEscrows'
import { useWallet } from '@/hooks/useWallet'
import { EscrowCard } from '@/components/EscrowCard'
import { Button } from '@/components/ui/button'
import { PublicKey } from '@solana/web3.js'
import { DebugEscrows } from '@/components/DebugEscrows'

export default function MarketplacePage() {
  const { escrows, loading, error, refetch } = useEscrows()
  const wallet = useWallet()

  const handleBuy = async (escrowPublicKey: PublicKey) => {
    // TODO: Implement buy functionality in Part 11
    console.log('Buy escrow:', escrowPublicKey.toBase58())
    alert('Buy functionality coming in Part 11!')
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">NFT Marketplace</h1>
            <p className="text-gray-500">Browse and purchase NFTs listed for sale</p>
          </div>
          <DebugEscrows />
          <Button onClick={refetch} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading marketplace...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={refetch} className="mt-4">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && escrows.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No NFTs listed for sale yet</p>
          <p className="text-sm text-gray-400 mt-2">Be the first to list your NFT!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {escrows.map((escrow) => {
          const isOwner = !!wallet.publicKey && escrow.maker.toBase58() === wallet.publicKey

          return (
            <EscrowCard
              key={escrow.publicKey.toBase58()}
              escrow={escrow}
              isOwner={isOwner}
              onBuy={() => handleBuy(escrow.publicKey)}
            />
          )
        })}
      </div>
    </div>
  )
}
