import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  createInitializeMetadataPointerInstruction,
  getMintLen,
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createUpdateFieldInstruction
} from "@solana/spl-token";

import {
  createInitializeInstruction,
  pack,
  type TokenMetadata,
} from "@solana/spl-token-metadata";
import wallet from "/home/nkb/.config/solana/id.json" with {type:"json"};

let keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const mint = Keypair.generate();

const metadata: TokenMetadata = {
  mint: mint.publicKey,
  name: "NKB",
  symbol: "NKB",
  uri: "https://raw.githubusercontent.com/anurg/TurbinePB_Q425_anurg/refs/heads/main/nkb.json",
  additionalMetadata: [["description", "Everything Crypto!"]],
};

// Size of Mint Account with extensions
const mintLen = getMintLen([ExtensionType.MetadataPointer]);

// Size of the Metadata Extension
const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

// Minimum lamports required for Mint Account
const lamports = await connection.getMinimumBalanceForRentExemption(
  mintLen + metadataLen
);

const createAccountInstruction = SystemProgram.createAccount({
  fromPubkey: keypair.publicKey,
  newAccountPubkey: mint.publicKey,
  space: mintLen,
  lamports,
  programId: TOKEN_2022_PROGRAM_ID,
});

const initializeMetadataPointer = createInitializeMetadataPointerInstruction(
  mint.publicKey,
  keypair.publicKey,
  mint.publicKey,
  TOKEN_2022_PROGRAM_ID
);

const initializeMintInstruction = createInitializeMintInstruction(
  mint.publicKey,
  6,
  keypair.publicKey,
  null,
  TOKEN_2022_PROGRAM_ID
);

const initializeMetadataInstruction = createInitializeInstruction({
  programId: TOKEN_2022_PROGRAM_ID,
  mint: mint.publicKey,
  metadata: mint.publicKey,
  name: metadata.name,
  symbol: metadata.symbol,
  uri: metadata.uri,
  mintAuthority: keypair.publicKey,
  updateAuthority: keypair.publicKey,
});

const updateMetadataFieldInstructions = createUpdateFieldInstruction({
  metadata: mint.publicKey,
  updateAuthority: keypair.publicKey,
  programId: TOKEN_2022_PROGRAM_ID,
  field: metadata.additionalMetadata[0][0],
  value: metadata.additionalMetadata[0][1],
});

const transaction = new Transaction().add(
  createAccountInstruction,
  initializeMetadataPointer,
  initializeMintInstruction,
  initializeMetadataInstruction,
  updateMetadataFieldInstructions
);

const signature = await sendAndConfirmTransaction(connection, transaction, [
  keypair,
  mint,
]);
console.log(`Mint Address: ${mint.publicKey}`);
console.log(
  `Mint created! Check out your TX here: https://explorer.solana.com/tx/${signature}?cluster=devnet`
);
