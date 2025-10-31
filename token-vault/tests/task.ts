import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  createMint,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getMint,
  mintTo,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { TokenVault } from "../target/types/token_vault";
//// To run this task script, change in Anchor.toml
// [provider]
// cluster = "devnet"
// wallet = "~/.config/solana/id.json"
//[scripts]
// test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**//task.ts"

describe("token-vault", () => {
  // Configure the client to use the local cluster.
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  let owner = provider.wallet;

  const program = anchor.workspace.tokenVault as Program<TokenVault>;
  /*
  1. Make Anchor Provider wallet to owner.
  2. in Before hook, Mint Tokens 
  3. Create owner_ata_a and mint tokens to it
  3. Now Initialize Vault.
  */
  let mint: anchor.web3.PublicKey;
  let owner_ata: anchor.web3.PublicKey;
  let vaultStatePDA: anchor.web3.PublicKey;
  let vaultStateBump: number;
  let vault: anchor.web3.PublicKey;

  before(async () => {
    mint = new anchor.web3.PublicKey(
      "47DeD9hzZAHX9SMq99PGpvu4MGqaw4JY4oZvpGy3caB2"
    );
    console.log(`mint ${mint}`);
    owner_ata = getAssociatedTokenAddressSync(mint, owner.publicKey,true,TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
    //Creating Owner ATA to hold the minted Tokens
  //   const owner_ata_tx = new anchor.web3.Transaction().add(
  //     await createAssociatedTokenAccountInstruction(
  //       provider.wallet.publicKey,
  //       owner_ata,
  //       owner.publicKey,
  //       mint,
  //       TOKEN_2022_PROGRAM_ID,
  //       ASSOCIATED_TOKEN_PROGRAM_ID
  //     )
  //   );
  //   await provider.sendAndConfirm(owner_ata_tx);
  //   console.log(`Owner ATA create- ${owner_ata_tx}`)
  //  // // Mint Tokens to Onwer Account
  //   await mintTo(
  //     provider.connection,
  //     provider.wallet.payer,
  //     mint,
  //     owner_ata,
  //     owner.publicKey,
  //     100000,
  //     [],
  //     undefined,
  //     TOKEN_2022_PROGRAM_ID
  //   );
    // Create seed, PDA, Vault Account
    [vaultStatePDA, vaultStateBump] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("state"), owner.publicKey.toBuffer()],
        program.programId
      );
      console.log(`Here 1`);
    vault = getAssociatedTokenAddressSync(mint, vaultStatePDA, true);
      console.log(`Here 2`);
    // let owner_bal = await getTokenBalanceSpl(
    //   provider.connection,
    //   owner_ata
    // ).catch((err) => console.log(err));
    // console.log(`Maker ATA a Balance - ${owner_bal}`);
  });
  it("Token Vault is initialized!", async () => {
    const tx = await program.methods
      .initialize()
      .accountsStrict({
        owner: provider.wallet.publicKey,
        mint: mint,
        vault,
        vaultState: vaultStatePDA,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
  it("Deposit Token in Vault!", async () => {
    const decimals = 1_000_000;
    const tx = await program.methods
      .deposit(new anchor.BN(10000 * decimals))
      .accountsStrict({
        owner: provider.wallet.publicKey,
        ownerAta: owner_ata,
        mint: mint,
        vault,
        vaultState: vaultStatePDA,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    let owner_bal = await getTokenBalanceSpl(
      provider.connection,
      owner_ata
    ).catch((err) => console.log(err));
    console.log(`Owner Token Balance - ${owner_bal}`);

    let vault_bal = await getTokenBalanceSpl(provider.connection, vault).catch(
      (err) => console.log(err)
    );
    console.log(`Vault Token Balance - ${vault_bal}`);
    console.log(`Vault Address - ${vault}`);
  });
  
});

// -------get SPL Token Balance
async function getTokenBalanceSpl(connection, tokenAccount) {
  const info = await getAccount(connection, tokenAccount);
  const amount = Number(info.amount);
  const mint = await getMint(connection, info.mint);
  const balance = amount / 10 ** mint.decimals;
  // console.log('Balance (using Solana-Web3.js): ', balance);
  return balance;
}

