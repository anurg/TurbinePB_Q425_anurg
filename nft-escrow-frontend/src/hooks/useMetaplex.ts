'use client'

import { useMemo } from 'react'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { useConnection } from './useConnection'
import { RPC_ENDPOINT } from '@/lib/constants'
import { HooksClientContext } from 'next/dist/server/route-modules/app-page/vendored/contexts/entrypoints'

export function useMetaplex() {
  const umi = useMemo(() => {
    return createUmi(RPC_ENDPOINT).use(mplTokenMetadata())
  }, [])

  return umi
}
