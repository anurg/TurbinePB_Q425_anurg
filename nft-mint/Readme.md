##### NFT Minting

##### Clone Repo and change directory to nft-mint

```
git clone
cd nft-mint
```

##### Install dependencies

```
npm install
```

##### Upload Image on Araweave

```
npm run nft-image
```

##### Upload Metadata on Araweave

```
npm run nft-metadata
```

##### Mint NFT on Devnet. Make sure your wallet has devnet Sol.

```
npm run nft-mint
```

Here is the NFT Minted on Devnet
https://explorer.solana.com/tx/4qmNYv14miGiJWmV8M7N2ZVVucyYTprxP51T5zkeHHZJXpYZ9jSQXoBL6CbU2M6pWXuzsqC9vL8jLsxZM84rfqf5?cluster=devnet

##### Problems with P2P NFT sale

1. Trust required with other party
2. High chances of Fraud
3. Need to connect through some platform or Social Media App
4. Negotaiations required for reaching at agreeable Price
5. Manually transfer NFT after verifying received amount

##### Solution 

1. Marketplace where users can list NFT for Sale with asking price. The NFT is locked in escrow account which transfers the NFT to buy when he sends the amount asked as Price. The entire process is trustless where both parties can be sure of the outcome of the deal. The downside is that to list NFT's in merket place, all NFT's should be minted beforehand, which will require creator to spend lot of lamports on minting.
    The solution to cost is cNFT(Compressed NFT) but they are difficult to index and not all market places support them. The complexity  in code is also increased for Developer to handle the operations linked to cNFT's.

2. Metaplex Cand ymachine - Creator can setup candy machine for their entire collection with Price fixed per NFT. Users can mint trustlessly NFT's and randomness ensures that NFT are fairly distributed regardless of rarity traits. Candy machine also saves creator from spending on Minting cost as Minting cost is paid by User minting NFT.

