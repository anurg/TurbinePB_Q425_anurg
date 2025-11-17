import  bs58 from "bs58";
import { Keypair } from "@solana/web3.js";

// Assuming your Uint8Array is a 64-byte secret key
const secretKeyUint8Array = new Uint8Array([
  85, 119, 185, 25, 183, 186, 191, 200, 20, 60, 109, 174, 90, 115, 177, 1, 122,
  191, 176, 56, 47, 104, 12, 121, 79, 135, 20, 43, 172, 51, 9, 6, 29, 68, 210,
  69, 71, 1, 33, 129, 243, 157, 96, 164, 188, 45, 166, 148, 131, 169, 230, 100,
  168, 118, 67, 56, 226, 33, 184, 74, 193, 57, 60, 197,
]);

// Convert the Uint8Array to a Keypair object
const keypair = Keypair.fromSecretKey(secretKeyUint8Array);

// Get the Base58 encoded private key string
const base58PrivateKey = bs58.encode(keypair.secretKey);

console.log("Base58 Private Key for Phantom import:", base58PrivateKey);
