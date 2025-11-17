'use client'

import { useWallet } from '@/hooks/useWallet'
import { useConnection } from '@/hooks/useConnection'
import { useEffect, useState } from 'react'
import { LAMPORTS_PER_SOL } from '@/lib/constants'
import { address } from 'gill'

export function TestConnection() {
  const wallet = useWallet()
  const { rpc } = useConnection()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (wallet.publicKey) {
      setLoading(true)
      // Convert string address to Gill Address type
      const addr = address(wallet.publicKey)

      rpc
        .getBalance(addr)
        .send()
        .then((response) => {
          setBalance(Number(response.value) / LAMPORTS_PER_SOL)
          setLoading(false)
        })
        .catch((err) => {
          console.error('Failed to fetch balance:', err)
          setLoading(false)
        })
    } else {
      setBalance(null)
    }
  }, [wallet.publicKey, rpc])

  return (
    <div className="p-6 border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Connection Test</h2>

      {wallet.connected ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <p className="text-green-600 font-semibold">Wallet Connected</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1">Wallet</p>
            <p className="font-mono text-sm">{wallet.wallet?.name}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1">Address</p>
            <p className="font-mono text-sm break-all">{wallet.publicKey}</p>
          </div>

          {loading ? (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <p className="text-xs text-gray-500">Loading balance...</p>
            </div>
          ) : balance !== null ? (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <p className="text-xs text-gray-500 mb-1">Balance</p>
              <p className="font-semibold text-lg">{balance.toFixed(4)} SOL</p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3 text-center py-4">
          <p className="text-gray-600 dark:text-gray-400">Wallet not connected</p>
          <p className="text-sm text-gray-500">Click the "Select Wallet" button in the header to connect</p>
        </div>
      )}
    </div>
  )
}
