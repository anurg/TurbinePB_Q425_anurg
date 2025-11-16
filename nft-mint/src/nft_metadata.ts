import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "/home/nkb/.config/solana/id.json";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile, readFileSync } from "fs";
import path from "path";
const umi = createUmi("https://api.devnet.solana.com");
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader({ address: "https://devnet.irys.xyz" }));
umi.use(signerIdentity(signer));

(async () => {
  try {
    // Follow this JSON structure
    // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure
    const image =
      "https://gateway.irys.xyz/EvCZSSJKRPtB3qrWBtbRbMNGpRa7EvaaZ4pXDxNTRssQ";
    const metadata = {
      name: "Witch_01",
      description: "Witch on Solana",
      image: image,
      external_url: "https://witchezzfrenzy.com",
      attributes: [
        {
          trait_type: "hat",
          value: "sailor-blue",
        },
        {
          trait_type: "action",
          value: "laughing",
        },
      ],
      properties: {
        files: [
          {
            uri: image,
            type: "image/jpeg",
          },
        ],
        category: "image",
      },
    };
    const myUri = await umi.uploader.uploadJson(metadata);
    console.log("Your metadata URI: ", myUri);
    // const image = ???
    // const metadata = {
    //     name: "?",
    //     symbol: "?",
    //     description: "?",
    //     image: "?",
    //     attributes: [
    //         {trait_type: '?', value: '?'}
    //     ],
    //     properties: {
    //         files: [
    //             {
    //                 type: "image/png",
    //                 uri: "?"
    //             },
    //         ]
    //     },
    //     creators: []
    // };
    // const myUri = ???
    // console.log("Your metadata URI: ", myUri);
  } catch (e) {
    console.log(`Some error-${e}`);
  }
})();

// Your metadata URI:  https://gateway.irys.xyz/BzgZh5n7Q9a6RKEWABnPWXCgCmRgcMNzkCG7JU7ztR3e

//Your metadata URI:  https://gateway.irys.xyz/EPyhj4KUga3SSjTSMFN46RrEEpkQofuC7SpW8DhjNEVC
