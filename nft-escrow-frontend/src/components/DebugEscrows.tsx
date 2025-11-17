'use client'

import { useState } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { RPC_ENDPOINT, PROGRAM_ID } from '@/lib/constants'
import { Button } from '@/components/ui/button'

export function DebugEscrows() {
  const [result, setResult] = useState<string>('')

  const checkEscrows = async () => {
    try {
      const connection = new Connection(RPC_ENDPOINT, 'confirmed')

      // Get ALL accounts owned by program (no filter)
      const allAccounts = await connection.getProgramAccounts(PROGRAM_ID)

      setResult(
        `Total program accounts: ${allAccounts.length}\n\n` +
          allAccounts
            .map((acc, i) => `${i + 1}. ${acc.pubkey.toBase58()}\n   Data size: ${acc.account.data.length} bytes`)
            .join('\n'),
      )
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    }
  }

  return (
    <div className="p-4 border rounded mb-4">
      <h3 className="font-bold mb-2">Debug: Check Program Accounts</h3>
      <Button onClick={checkEscrows}>Check All Program Accounts</Button>
      {result && <pre className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 text-xs overflow-auto max-h-64">{result}</pre>}
    </div>
  )
}
