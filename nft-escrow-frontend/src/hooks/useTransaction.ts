'use client'

import { useState, useCallback } from 'react'
import { Transaction, TransactionInstruction, sendAndConfirmTransaction, Keypair } from '@solana/web3.js'
import { useConnection } from './useConnection'
import { useWallet } from './useWallet'

export function useTransaction() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendTransaction = useCallback(
    async (instructions: TransactionInstruction[], signers?: Keypair[]): Promise<string> => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected')
      }

      setLoading(true)
      setError(null)

      try {
        // Create transaction
        const transaction = new Transaction()

        // Get recent blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

        transaction.recentBlockhash = blockhash
        transaction.feePayer = wallet.publicKey

        // Add instructions
        transaction.add(...instructions)

        // Sign transaction
        if (signers && signers.length > 0) {
          transaction.partialSign(...signers)
        }

        const signedTx = await wallet.signTransaction(transaction)

        // Send transaction
        const signature = await connection.sendRawTransaction(signedTx.serialize())

        // Confirm transaction
        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        })

        setLoading(false)
        return signature
      } catch (err: any) {
        const errorMessage = err?.message || 'Transaction failed'
        setError(errorMessage)
        setLoading(false)
        throw new Error(errorMessage)
      }
    },
    [connection, wallet],
  )

  return {
    sendTransaction,
    loading,
    error,
  }
}
