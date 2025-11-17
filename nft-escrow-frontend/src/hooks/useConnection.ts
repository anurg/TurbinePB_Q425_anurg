'use client'

import { useSolana } from '@/components/solana/use-solana'

export function useConnection() {
  const { client } = useSolana()

  return {
    connection: client,
    rpc: client.rpc,
  }
}
