'use client'

import { useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { createTransaction, signAndSendTransactionMessageWithSigners, getBase58Decoder } from 'gill'
import { useWalletUiSigner } from '@wallet-ui/react'
import { useSolana } from '@/components/solana/use-solana'
import { buildMakeInstruction, buildTakeInstruction, buildRefundInstruction } from '@/lib/escrow-instructions'
import { formatError, lamportsToSol } from '@/lib/utils'
import { toast } from 'sonner'

export function useEscrowTransactions() {
  const { client, account } = useSolana()
  const signer = useWalletUiSigner({ account: account! })
  const [loading, setLoading] = useState(false)

  /**
   * Create an escrow listing
   */
  const createEscrow = async (nftMint: string, priceInLamports: bigint) => {
    if (!account || !signer) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)

    try {
      const maker = new PublicKey(account.address)
      const mint = new PublicKey(nftMint)

      // Build the make instruction using Codama generated function (ASYNC)
      const makeInstruction = await buildMakeInstruction({
        maker,
        makerSigner: signer,
        nftMint: mint,
        price: priceInLamports,
      })

      // Get latest blockhash
      const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()

      // Create transaction using Gill
      const transaction = createTransaction({
        feePayer: signer,
        version: 0,
        latestBlockhash,
        instructions: [makeInstruction],
      })

      // Sign and send
      toast.loading('Creating escrow...', { id: 'create-escrow' })

      const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
      const signature = getBase58Decoder().decode(signatureBytes)

      console.log('✅ Escrow created successfully!');
      console.log('📝 Transaction signature:', signature);
      console.log('🔗 View on explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

      toast.success(
        `Escrow created! Listed for ${lamportsToSol(priceInLamports).toFixed(2)} SOL - Check console for explorer link`,
        { id: 'create-escrow', duration: 10000 }
      );

      setLoading(false);
      return signature;
    } catch (err: any) {
      console.error('Create escrow error:', err)
      const errorMessage = formatError(err)
      toast.error(`Failed to create escrow: ${errorMessage}`, { id: 'create-escrow' })
      setLoading(false)
      throw err
    }
  }

  /**
   * Buy/accept an escrow listing (take)
   */
  const takeEscrow = async (maker: PublicKey, nftMint: PublicKey, priceInLamports: bigint) => {
    if (!account || !signer) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)

    try {
      const taker = new PublicKey(account.address)

      // Build the take instruction using Codama generated function (ASYNC)
      const takeInstruction = await buildTakeInstruction({
        maker,
        taker,
        takerSigner: signer,
        nftMint,
      })

      // Get latest blockhash
      const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()

      // Create transaction using Gill
      const transaction = createTransaction({
        feePayer: signer,
        version: 0,
        latestBlockhash,
        instructions: [takeInstruction],
      })

      // Sign and send
      toast.loading('Purchasing NFT...', { id: 'take-escrow' })

      const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
      const signature = getBase58Decoder().decode(signatureBytes)

      console.log('✅ NFT purchased successfully!');
      console.log('📝 Transaction signature:', signature);
      console.log('🔗 View on explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

      toast.success(
        `NFT purchased for ${lamportsToSol(priceInLamports).toFixed(2)} SOL! Check your wallet.`,
        { id: 'take-escrow', duration: 10000 }
      );

      setLoading(false);
      return signature;
    } catch (err: any) {
      console.error('Take escrow error:', err)
      const errorMessage = formatError(err)
      toast.error(`Failed to purchase NFT: ${errorMessage}`, { id: 'take-escrow' })
      setLoading(false)
      throw err
    }
  }

  /**
   * Cancel an escrow listing and get NFT back (refund)
   */
  const refundEscrow = async (nftMint: PublicKey) => {
    if (!account || !signer) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)

    try {
      const maker = new PublicKey(account.address)

      // Build the refund instruction using Codama generated function (ASYNC)
      const refundInstruction = await buildRefundInstruction({
        maker,
        makerSigner: signer,
        nftMint,
      })

      // Get latest blockhash
      const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()

      // Create transaction using Gill
      const transaction = createTransaction({
        feePayer: signer,
        version: 0,
        latestBlockhash,
        instructions: [refundInstruction],
      })

      // Sign and send
      toast.loading('Canceling listing...', { id: 'refund-escrow' })

      const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
      const signature = getBase58Decoder().decode(signatureBytes)

      console.log('✅ Listing canceled successfully!');
      console.log('📝 Transaction signature:', signature);
      console.log('🔗 View on explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

      toast.success(
        'Listing canceled! Your NFT has been returned to your wallet.',
        { id: 'refund-escrow', duration: 10000 }
      );

      setLoading(false);
      return signature;
    } catch (err: any) {
      console.error('Refund escrow error:', err)
      const errorMessage = formatError(err)
      toast.error(`Failed to cancel listing: ${errorMessage}`, { id: 'refund-escrow' })
      setLoading(false)
      throw err
    }
  }

  return {
    createEscrow,
    takeEscrow,
    refundEscrow,
    loading,
  }
}
