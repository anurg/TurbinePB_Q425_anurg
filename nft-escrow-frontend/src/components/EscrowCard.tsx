'use client'

import { EscrowWithMetadata } from '@/types/escrow'
import { formatSol, shortenAddress } from '@/lib/utils'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface EscrowCardProps {
  escrow: EscrowWithMetadata
  onBuy?: () => void
  onCancel?: () => void
  showActions?: boolean
  isOwner?: boolean
}

export function EscrowCard({ escrow, onBuy, onCancel, showActions = true, isOwner = false }: EscrowCardProps) {
  const imageUrl = escrow.metadata?.image || '/placeholder-nft.png'
  const name = escrow.metadata?.name || 'Unknown NFT'
  const symbol = escrow.metadata?.symbol || ''

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-nft.png'
          }}
        />
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold truncate">{name}</h3>
          {symbol && <p className="text-sm text-gray-500">{symbol}</p>}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Price</span>
            <span className="font-bold text-lg">{formatSol(escrow.received)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Seller</span>
            <span className="text-xs font-mono">{shortenAddress(escrow.maker.toBase58(), 4)}</span>
          </div>
        </div>

        {showActions && (
          <div className="pt-2">
            {isOwner ? (
              <Button variant="outline" className="w-full" onClick={onCancel}>
                Cancel Listing
              </Button>
            ) : (
              <Button className="w-full" onClick={onBuy}>
                Buy Now
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
