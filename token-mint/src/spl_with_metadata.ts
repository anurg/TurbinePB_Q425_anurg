import { Connection, Keypair, sendAndConfirmRawTransaction, SystemProgram, Transaction, type Commitment,sendAndConfirmTransaction } from "@solana/web3.js";
import { ExtensionType, getMintLen,TYPE_SIZE,LENGTH_SIZE, getMinimumBalanceForRentExemptAccount, TOKEN_2022_PROGRAM_ID, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, updateMetadataPointerData, createUpdateMetadataPointerInstruction } from "@solana/spl-token";
import {createInitializeInstruction, createUpdateFieldInstruction, pack, type TokenMetadata} from "@solana/spl-token-metadata";

import wallet from "/home/nkb/.config/solana/id.json" with {type:"json"};
// Importing Wallet from local Solana config
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// generating key for Mint Address
const mint = Keypair.generate();
const commitment:Commitment ="confirmed";
const connection = new Connection("https://api.devnet.solana.com",commitment);

const metadata:TokenMetadata = {
    mint:mint.publicKey,
    name:"NKB",
    symbol:"NKB",
    uri:"https://raw.githubusercontent.com/anurg/TurbinePB_Q425_anurg/refs/heads/main/nkb.json",
    updateAuthority:keypair.publicKey,
    additionalMetadata:[["description","Everything Crypto"]],
};

// Size of the mint account with extensions
const mintLen = getMintLen([ExtensionType.MetadataPointer]);

// Size of the metadata 
const metadataLen = TYPE_SIZE + LENGTH_SIZE+ pack(metadata).length;

// Min lamports required for rent free Mint account
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: keypair.publicKey,
    newAccountPubkey: mint.publicKey,
    lamports,
    space:mintLen,
    programId:TOKEN_2022_PROGRAM_ID
    });

const initializeMetaData = createInitializeMetadataPointerInstruction(
    mint.publicKey,
    keypair.publicKey,
    mint.publicKey,
    TOKEN_2022_PROGRAM_ID
);

const initializeMint = createInitializeMintInstruction(
    mint.publicKey,
    6,
    keypair.publicKey,
    null,
    TOKEN_2022_PROGRAM_ID
);

const initializeMetadataInstruction = createInitializeInstruction({
    mint: mint.publicKey,
    metadata: mint.publicKey,
    name:metadata.name,
    symbol:metadata.symbol,
    uri:metadata.uri,
    mintAuthority:keypair.publicKey,
    updateAuthority:keypair.publicKey,
    programId:TOKEN_2022_PROGRAM_ID
});

const updateMetadataInstruction = createUpdateFieldInstruction({
    programId:TOKEN_2022_PROGRAM_ID,
    metadata:mint.publicKey,
    updateAuthority:keypair.publicKey,
    field:metadata.additionalMetadata[0][0],
    value:metadata.additionalMetadata[0][1]
});

const transaction = new Transaction().add(
    createAccountInstruction,
    initializeMetaData,
    initializeMint,
    initializeMetadataInstruction,
    updateMetadataInstruction
);
const txnSignature = await sendAndConfirmTransaction(connection,transaction,[keypair,mint]);
console.log(`Mint created! Mint Address: ${mint.publicKey}`);
console.log(`Check out your TX here: https://explorer.solana.com/tx/${txnSignature}?cluster=devnet`);
