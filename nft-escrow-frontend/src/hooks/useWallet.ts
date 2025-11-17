'use client'

import { useSolana } from '@/components/solana/use-solana'

export function useWallet() {
  const { account, connected, wallet, wallets, connect, disconnect } = useSolana()

  return {
    publicKey: account?.address || null,
    connected,
    account,
    wallet,
    wallets,
    connect,
    disconnect,
  }
}
