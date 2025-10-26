##### Instrcutions to Mint new Token with Name, Symbol, and other metadata

#### Clone the Repo and change directory to token-mint

```
git clone https://github.com/anurg/TurbinePB_Q425_anurg.git
cd token-mint
```

##### Install dependencies

```
npm install
```

##### Change the following as per your Token metadata

```
name:"NKB",
    symbol:"NKB",
    uri:"https://raw.githubusercontent.com/anurg/TurbinePB_Q425_anurg/refs/heads/main/nkb.json",
    additionalMetadata:[["description","Everything Crypto"]],
```

##### Token Image

Inside the json file , you can give URL of Image

```
{
    "name": "NKB",
    "symbol": "NKB",
    "description": "Everything Crypto!",
    "image": "https://www.nkbblocks.com/images/logo.png",
    "attributes": [
        {
            "trait_type": "Item",
            "value": "Developer Portal"
        }
    ]
}
```

##### Run the ts file

```
npx ts-node src/spl_with_metadata.ts
```

This will output the generated Token & Transaction Signature

```
Mint created! Mint Address: 5tPPxuYuJMLwiQAsLaHTECHrdgFqHsayYh6qPKqm1HTQ
Check out your TX here: https://explorer.solana.com/tx/2RbrPSGnnaQF2Nh42VNqsnKibaksmtuuQzsb1swFKNmRHuBRY75FJBqfWPkzxe5pSqTnwj1rYSsLfXARGhaU5daB?cluster=devnet
```
