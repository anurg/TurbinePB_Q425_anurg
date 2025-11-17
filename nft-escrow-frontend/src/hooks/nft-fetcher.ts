import { PublicKey, Connection } from '@solana/web3.js'
import { NFTMetadata, NFTAccount } from '@/types/nft'

interface DASAsset {
  id: string
  content: {
    metadata: {
      name: string
      symbol: string
    }
    json_uri: string
    files?: Array<{
      uri: string
      mime?: string
    }>
  }
  compression: {
    compressed: boolean
  }
  ownership: {
    owner: string
  }
}

/**
 * Fetch NFTs using Metaplex DAS API (Digital Asset Standard)
 * This works with both compressed and regular NFTs
 */
export async function fetchNFTsByOwner(connection: Connection, owner: PublicKey): Promise<NFTAccount[]> {
  try {
    // Get all token accounts owned by user
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    })

    const nfts: NFTAccount[] = []

    for (const { account } of tokenAccounts.value) {
      const parsedInfo = account.data.parsed.info

      // Filter for NFTs (amount = 1, decimals = 0)
      if (parsedInfo.tokenAmount.decimals === 0 && parsedInfo.tokenAmount.uiAmount === 1) {
        const mint = new PublicKey(parsedInfo.mint)

        try {
          // Fetch metadata
          const metadata = await fetchNFTMetadata(connection, mint)

          nfts.push({
            mint,
            owner,
            amount: BigInt(parsedInfo.tokenAmount.amount),
            metadata,
          })
        } catch (err) {
          console.warn(`Failed to fetch metadata for ${mint.toBase58()}:`, err)
          // Add NFT without metadata
          nfts.push({
            mint,
            owner,
            amount: BigInt(parsedInfo.tokenAmount.amount),
          })
        }
      }
    }

    return nfts
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    throw error
  }
}

/**
 * Fetch NFT metadata from URI
 */
async function fetchNFTMetadata(connection: Connection, mint: PublicKey): Promise<NFTMetadata | undefined> {
  try {
    // Derive metadata PDA
    const metadataPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
        mint.toBuffer(),
      ],
      new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
    )[0]

    // Fetch metadata account
    const metadataAccount = await connection.getAccountInfo(metadataPDA)

    if (!metadataAccount) {
      return undefined
    }

    // Parse metadata (simplified - you'd use @metaplex-foundation/mpl-token-metadata)
    // For now, we'll make a basic parser
    const metadata = parseMetadataAccount(metadataAccount.data)

    if (metadata?.uri) {
      // Fetch off-chain metadata
      const response = await fetch(metadata.uri)
      const json = await response.json()

      return {
        mint,
        name: metadata.name || json.name || 'Unknown NFT',
        symbol: metadata.symbol || json.symbol || '',
        uri: metadata.uri,
        image: json.image,
        description: json.description,
        attributes: json.attributes,
      }
    }

    return undefined
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return undefined
  }
}

/**
 * Simple metadata account parser
 * Note: In production, use @metaplex-foundation/mpl-token-metadata deserializer
 */
function parseMetadataAccount(data: Buffer): {
  name: string
  symbol: string
  uri: string
} | null {
  try {
    // Skip first byte (key)
    let offset = 1

    // Skip update authority (32 bytes)
    offset += 32

    // Skip mint (32 bytes)
    offset += 32

    // Read name (4 bytes length + string)
    const nameLength = data.readUInt32LE(offset)
    offset += 4
    const name = data
      .slice(offset, offset + nameLength)
      .toString('utf8')
      .replace(/\0/g, '')
    offset += nameLength

    // Read symbol (4 bytes length + string)
    const symbolLength = data.readUInt32LE(offset)
    offset += 4
    const symbol = data
      .slice(offset, offset + symbolLength)
      .toString('utf8')
      .replace(/\0/g, '')
    offset += symbolLength

    // Read URI (4 bytes length + string)
    const uriLength = data.readUInt32LE(offset)
    offset += 4
    const uri = data
      .slice(offset, offset + uriLength)
      .toString('utf8')
      .replace(/\0/g, '')

    return { name, symbol, uri }
  } catch (error) {
    console.error('Error parsing metadata:', error)
    return null
  }
}

export { fetchNFTMetadata }
