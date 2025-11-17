'use client'

import { useState } from 'react'
import { useEscrows } from '@/hooks/useEscrows'
import { useWallet } from '@/hooks/useWallet'
import { useEscrowTransactions } from '@/hooks/useEscrowTransactions'
import { EscrowCard } from '@/components/EscrowCard'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { PublicKey } from '@solana/web3.js'

export default function MyListingsPage() {
  const { escrows, loading, error, refetch } = useEscrows()
  const wallet = useWallet()
  const { refundEscrow, loading: txLoading } = useEscrowTransactions()

  const [cancelConfirm, setCancelConfirm] = useState<{ open: boolean; escrow: any | null }>({
    open: false,
    escrow: null,
  })

  // Filter to show only current user's listings
  const myListings = escrows.filter(
    (escrow) => !!wallet.publicKey && escrow.maker.toBase58() === wallet.publicKey
  )

  const handleCancelClick = (escrowPublicKey: PublicKey) => {
    const escrow = myListings.find(e => e.publicKey.toBase58() === escrowPublicKey.toBase58())
    if (!escrow) return
    setCancelConfirm({ open: true, escrow })
  }

  const confirmCancel = async () => {
    if (!cancelConfirm.escrow) return

    try {
      await refundEscrow(cancelConfirm.escrow.nftMint)
      await refetch()
    } catch (err) {
      console.error('Failed to cancel listing:', err)
    }
  }

  if (!wallet.publicKey) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Please connect your wallet to view your listings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Listings</h1>
            <p className="text-gray-500">Manage your NFTs listed for sale</p>
          </div>
          <Button onClick={refetch} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading your listings...</p>
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

      {!loading && !error && myListings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have any active listings</p>
          <p className="text-sm text-gray-400 mt-2">
            Go to <a href="/my-nfts" className="underline">My NFTs</a> to list an NFT for sale
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {myListings.map((escrow) => (
          <EscrowCard
            key={escrow.publicKey.toBase58()}
            escrow={escrow}
            isOwner={true}
            onCancel={() => handleCancelClick(escrow.publicKey)}
          />
        ))}
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={cancelConfirm.open}
        onOpenChange={(open) => setCancelConfirm({ open, escrow: null })}
        onConfirm={confirmCancel}
        title="Cancel Listing"
        description={
          cancelConfirm.escrow
            ? `Are you sure you want to cancel the listing for ${cancelConfirm.escrow.metadata?.name || 'this NFT'}? The NFT will be returned to your wallet.`
            : ''
        }
        confirmText="Cancel Listing"
        variant="destructive"
        loading={txLoading}
      />
    </div>
  )
}
