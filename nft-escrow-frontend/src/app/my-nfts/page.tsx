'use client'

import { useState } from 'react'
import { useUserNFTs } from '@/hooks/useUserNFTs'
import { NFTCard } from '../../hooks/NFTCard'
import { CreateEscrowModal } from '@/components/CreateEscrowModal'
import { NFTAccount } from '@/types/nft'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/useWallet'

export default function MyNFTsPage() {
  const wallet = useWallet()
  const { nfts, loading, error, refetch } = useUserNFTs()
  const [selectedNFT, setSelectedNFT] = useState<NFTAccount | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleListNFT = (nft: NFTAccount) => {
    setSelectedNFT(nft)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedNFT(null)
  }

  const handleSuccess = () => {
    // Refresh NFT list after creating escrow
    refetch()
  }

  if (!wallet.connected) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">My NFTs</h1>
          <p className="text-gray-500">Please connect your wallet to view your NFTs</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My NFTs</h1>
        <p className="text-gray-500">Select an NFT to list it for sale on the marketplace</p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading your NFTs...</p>
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

      {!loading && !error && nfts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No NFTs found in your wallet</p>
          <p className="text-sm text-gray-400 mt-2">
            Make sure you're connected to devnet and have NFTs in your wallet
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {nfts.map((nft) => (
          <NFTCard
            key={nft.mint.toBase58()}
            nft={nft}
            action={
              <Button className="w-full" onClick={() => handleListNFT(nft)}>
                List for Sale
              </Button>
            }
          />
        ))}
      </div>

      <CreateEscrowModal nft={selectedNFT} open={modalOpen} onClose={handleModalClose} onSuccess={handleSuccess} />
    </div>
  )
}
