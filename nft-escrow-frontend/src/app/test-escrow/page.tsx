'use client';

import { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { RPC_ENDPOINT, PROGRAM_ID } from '@/lib/constants';
import bs58 from 'bs58';

export default function TestEscrowPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkEscrows = async () => {
    setLoading(true);
    setResult('Checking...\n');

    try {
      const connection = new Connection(RPC_ENDPOINT, 'confirmed');

      // Discriminator for Escrow account
      const ESCROW_DISCRIMINATOR = new Uint8Array([31, 213, 123, 187, 186, 22, 218, 155]);
      const discriminatorBase58 = bs58.encode(ESCROW_DISCRIMINATOR);

      setResult(prev => prev + `Program ID: ${PROGRAM_ID.toBase58()}\n`);
      setResult(prev => prev + `Discriminator (base58): ${discriminatorBase58}\n\n`);

      // Try getting ALL program accounts first
      setResult(prev => prev + 'Fetching ALL program accounts...\n');
      const allAccounts = await connection.getProgramAccounts(PROGRAM_ID);
      setResult(prev => prev + `Total program accounts: ${allAccounts.length}\n\n`);

      if (allAccounts.length > 0) {
        allAccounts.forEach((acc, i) => {
          const first8Bytes = acc.account.data.slice(0, 8);
          setResult(prev => prev + `Account ${i + 1}:\n`);
          setResult(prev => prev + `  Address: ${acc.pubkey.toBase58()}\n`);
          setResult(prev => prev + `  Data size: ${acc.account.data.length} bytes\n`);
          setResult(prev => prev + `  First 8 bytes: [${Array.from(first8Bytes).join(', ')}]\n`);
          setResult(prev => prev + `  Matches discriminator: ${first8Bytes.every((b, i) => b === ESCROW_DISCRIMINATOR[i])}\n\n`);
        });
      }

      // Now try with filter
      setResult(prev => prev + '\n--- Trying with discriminator filter ---\n');
      const filteredAccounts = await connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: discriminatorBase58,
            },
          },
        ],
      });

      setResult(prev => prev + `Filtered accounts: ${filteredAccounts.length}\n`);

    } catch (err: any) {
      setResult(prev => prev + `\nERROR: ${err.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Escrow Diagnostic Tool</h1>

      <Button onClick={checkEscrows} disabled={loading}>
        {loading ? 'Checking...' : 'Run Diagnostic'}
      </Button>

      {result && (
        <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto max-h-[600px] whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}
