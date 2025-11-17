'use client'

import { useWallet as useWalletAdapter } from '@solana/wallet-adapter-react'

export function useWallet() {
  return useWalletAdapter()
}
