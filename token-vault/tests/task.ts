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
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountIdempotent,
} from "@solana/spl-token";
import { TokenVault } from "../target/types/token_vault";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";

describe("token-vault", () => {
  // Configure the client to use the local cluster.
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  let owner = provider.wallet;

  // let user = anchor.web3.Keypair.generate(); // user will be minted Token

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
  const decimals = 1_000_000;
  before(async () => {
    mint = new anchor.web3.PublicKey(
      "EDT4VRxdvHvyYKordZ7668hZ8bGGFVmhC3Us6dXzaPZW"
    );
    console.log(`mint ${mint}`);
    // Verify the mint exists
    try {
      const mintInfo = await getMint(
        provider.connection,
        mint,
        "confirmed",
        TOKEN_2022_PROGRAM_ID
      );
      console.log(
        `Mint found! Decimals: ${mintInfo.decimals}- ${provider.connection.rpcEndpoint}`
      );
    } catch (error) {
      console.error(
        `Mint not found on this network!- ${provider.connection.rpcEndpoint}`
      );
      throw error;
    }
    //Creating User ATA to hold the minted Tokens
    owner_ata = getAssociatedTokenAddressSync(
      mint,
      owner.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    console.log(`user_ata ${owner_ata}`);
    // Create seed, PDA, Vault Account
    [vaultStatePDA, vaultStateBump] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("state"), owner.publicKey.toBuffer()],
        program.programId
      );
    vault = getAssociatedTokenAddressSync(
      mint,
      vaultStatePDA,
      true,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    let owner_bal = await getTokenBalanceSpl(
      provider.connection,
      owner_ata
    ).catch((err) => console.log(err));
    console.log(`Owner Token Balance-Initially- - ${owner_bal}`);
  });

  it("Token Vault is initialized!", async () => {
    try {
      // Check if vault state already exists
      const vaultStateAccount = await provider.connection.getAccountInfo(vault);
      if (vaultStateAccount) {
        let vault_bal = await getTokenBalanceSpl(
          provider.connection,
          vault
        ).catch((err) => console.log(err));
        console.log(`Owner Token Balance-Initially- - ${vault_bal}`);
        console.log("Vault already initialized, skipping...");
        return;
      }
      const tx = await program.methods
        .initialize()
        .accountsStrict({
          owner: owner.publicKey,
          mint: mint,
          vault,
          vaultState: vaultStatePDA,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([owner.payer])
        .rpc();
      console.log("Your transaction signature", tx);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  });

  it("Deposit Token in Vault!", async () => {
    const tx = await program.methods
      .deposit(new anchor.BN(10000 * decimals))
      .accountsStrict({
        owner: owner.publicKey,
        ownerAta: owner_ata,
        mint: mint,
        vault,
        vaultState: vaultStatePDA,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([owner.payer])
      .rpc();
    console.log("Your transaction signature", tx);
    let vault_bal = await getTokenBalanceSpl(provider.connection, vault).catch(
      (err) => console.log(err)
    );
    console.log(`Vault Token Balance - ${vault_bal}`);
    console.log(`Vault Address - ${vault}`);
      let owner_bal = await getTokenBalanceSpl(
      provider.connection,
      owner_ata
    ).catch((err) => console.log(err));
    console.log(`Owner Token Balance after deposit - ${owner_bal}`);
  });

  it("Withdraw Some Tokens from Vault!", async () => {
    const tx = await program.methods
      .withdraw(new anchor.BN(4000 * decimals))
      .accountsStrict({
        owner: owner.publicKey,
        ownerAta: owner_ata,
        mint: mint,
        vault,
        vaultState: vaultStatePDA,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([owner.payer])
      .rpc();
    console.log("Your transaction signature", tx);

    let owner_bal = await getTokenBalanceSpl(
      provider.connection,
      owner_ata
    ).catch((err) => console.log(err));
    console.log(
      `Owner Token Balance-after 4000 withdrawal from Vault  - ${owner_bal}`
    );

    let vault_bal = await getTokenBalanceSpl(provider.connection, vault).catch(
      (err) => console.log(err)
    );
    console.log(`Vault Token Balance after 4000 withdrawal - ${vault_bal}`);
  });
  it("Token Vault is Closed!", async () => {
      const tx = await program.methods
        .close()
        .accountsStrict({
          owner: owner.publicKey,
          mint: mint,
          ownerAta:owner_ata,
          vault,
          vaultState: vaultStatePDA,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([owner.payer])
        .rpc();
      console.log("Your transaction signature", tx);
    });
});

// -------get SPL Token Balance
async function getTokenBalanceSpl(connection, tokenAccount) {
  const info = await getAccount(
    connection,
    tokenAccount,
    "confirmed",
    TOKEN_2022_PROGRAM_ID
  );
  const amount = Number(info.amount);
  const mint = await getMint(
    connection,
    info.mint,
    "confirmed",
    TOKEN_2022_PROGRAM_ID
  );
  const balance = amount / 10 ** mint.decimals;
  return balance;
}


