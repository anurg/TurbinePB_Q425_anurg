// import DashboardFeature from '@/features/dashboard/dashboard-feature'

// export default function Home() {
//   return <DashboardFeature />
// }
'use client'
import DashboardFeature from '@/features/dashboard/dashboard-feature'
import { TestConnection } from '@/components/TestConnection'
import { useUserNFTs } from '@/hooks/useUserNFTs'
import { NFTCard } from '@/hooks/NFTCard'

export default function Home() {
  const { nfts, loading, error } = useUserNFTs()

  return (
    <main className="min-h-screen p-8">
      <DashboardFeature />
      <h1 className="text-4xl font-bold mb-8">NFT Escrow Marketplace</h1>

      <div className="mb-8">
        <TestConnection />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">My NFTs</h2>

        {loading && <p>Loading NFTs...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && nfts.length === 0 && <p className="text-gray-500">No NFTs found in your wallet</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft) => (
            <NFTCard key={nft.mint.toBase58()} nft={nft} onClick={() => console.log('NFT clicked:', nft)} />
          ))}
        </div>
      </div>
    </main>
  )
}
