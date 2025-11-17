'use client'

import { NFTAccount } from '@/types/nft'
import { shortenAddress } from '@/lib/utils'
import Image from 'next/image'

interface NFTCardProps {
  nft: NFTAccount
  onClick?: () => void
  action?: React.ReactNode
}

export function NFTCard({ nft, onClick, action }: NFTCardProps) {
  const imageUrl = nft.metadata?.image || '/placeholder-nft.png'
  const name = nft.metadata?.name || 'Unknown NFT'
  const symbol = nft.metadata?.symbol || ''

  return (
    <div
      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback for broken images
            e.currentTarget.src = '/placeholder-nft.png'
          }}
        />
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold truncate">{name}</h3>
        {symbol && <p className="text-sm text-gray-500">{symbol}</p>}
        <p className="text-xs text-gray-400 font-mono">{shortenAddress(nft.mint.toBase58(), 6)}</p>

        {action && <div className="pt-2">{action}</div>}
      </div>
    </div>
  )
}
