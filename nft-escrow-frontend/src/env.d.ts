declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SOLANA_NETWORK: 'devnet' | 'mainnet-beta' | 'testnet'
    NEXT_PUBLIC_PROGRAM_ID: string
    NEXT_PUBLIC_RPC_ENDPOINT: string
  }
}
