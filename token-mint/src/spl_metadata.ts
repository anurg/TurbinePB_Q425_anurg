import { Connection, Keypair, PublicKey, type Commitment } from "@solana/web3.js";
import { getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import {type TokenMetadata} from "@solana/spl-token-metadata";
import wallet from "/home/nkb/.config/solana/id.json" with {type:"json"};

let keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

let commitment:Commitment = "confirmed";
let connection = new Connection("https://api.devnet.solana.com",commitment);

let mint = new PublicKey("CYBGtByTwB9yG8dqFuAVyT1MTzF7Lkanj4WbFVuugGns");
let decimals = 1_000_000;

const metadata:TokenMetadata = {
    mint,
    name: "NKB",
    symbol:"NKB",
    uri: "https://raw.githubusercontent.com/anurg/TurbinePB_Q425_anurg/refs/heads/main/nkb.json",
    updateAuthority:keypair.publicKey,
    additionalMetadata:[["description","Everything Crypto!"],["image", "https://www.nkbblocks.com/images/logo.png"]]
}

console.log(`spl_metadata`);
