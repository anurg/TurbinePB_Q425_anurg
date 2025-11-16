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
import { sign } from "crypto";
const umi = createUmi("https://api.devnet.solana.com");
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
console.log(`Public key wallet- ${signer.publicKey}`);
umi.use(irysUploader({ address: "https://devnet.irys.xyz" }));
umi.use(signerIdentity(signer));

(async () => {
  try {
    //1. Load image
    const filepath = path.join(__dirname, "laughing - sailor hat (blue).jpg");
    const image = await readFileSync(filepath);
    //2. Convert image to generic file.
    const file = createGenericFile(image, "laughing - sailor hat (blue).jpg");
    const [myUri] = await umi.uploader.upload([file]);
    //3. Upload image

    // const image = ???
    // const [myUri] = ???
    console.log("Your image URI: ", myUri);
    // console.log("Your image URI: ", myUri);
  } catch (e) {
    console.log(`Some error-${e}`);
  }
})();

// Your image URI:  https://gateway.irys.xyz/ARehTXsn1mKDiY4uyXSCiKG4ntAk2JKu3pHWbS87z36B

//Your image URI:  https://gateway.irys.xyz/EvCZSSJKRPtB3qrWBtbRbMNGpRa7EvaaZ4pXDxNTRssQ
