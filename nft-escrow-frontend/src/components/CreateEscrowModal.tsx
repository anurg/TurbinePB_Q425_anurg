'use client'

import { useState } from 'react'
import { NFTAccount } from '@/types/nft'
import { useEscrowTransactions } from '@/hooks/useEscrowTransactions'
import { solToLamports } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

interface CreateEscrowModalProps {
  nft: NFTAccount | null
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateEscrowModal({ nft, open, onClose, onSuccess }: CreateEscrowModalProps) {
  const [price, setPrice] = useState('')
  const { createEscrow, loading } = useEscrowTransactions()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nft || !price) return

    try {
      const priceInSol = parseFloat(price)
      if (isNaN(priceInSol) || priceInSol <= 0) {
        throw new Error('Invalid price')
      }

      const priceInLamports = solToLamports(priceInSol)

      await createEscrow(nft.mint.toBase58(), priceInLamports)

      // Success
      setPrice('')
      onClose()
      onSuccess?.()
    } catch (err) {
      console.error('Failed to create escrow:', err)
    }
  }

  if (!nft) return null

  const imageUrl = nft.metadata?.image || '/placeholder-nft.png'
  const name = nft.metadata?.name || 'Unknown NFT'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>List NFT for Sale</DialogTitle>
          <DialogDescription>Set a price in SOL to list your NFT on the marketplace</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* NFT Preview */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="relative w-16 h-16 rounded overflow-hidden">
              <Image src={imageUrl} alt={name} fill className="object-cover" />
            </div>
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-xs text-gray-500 font-mono">{nft.mint.toBase58().slice(0, 8)}...</p>
            </div>
          </div>

          {/* Price Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (SOL)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500">Buyers will pay this amount to purchase your NFT</p>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !price}>
                {loading ? 'Creating...' : 'List NFT'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
