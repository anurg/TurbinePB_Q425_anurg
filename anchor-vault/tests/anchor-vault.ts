import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {Keypair} from "@solana/web3.js";
import { AnchorVault } from "../target/types/anchor_vault";

describe("anchor-vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.anchorVault as Program<AnchorVault>;
  let keypair = Keypair.generate();
  it("Is initialized!", async () => {
    // Add your test here.
    

    const tx = await program.methods.initialize().accounts({
      user: keypair.publicKey
    }).signers([keypair]).rpc();
    console.log("Your transaction signature", tx);
  });
});

// Test Cases for Vault
// 1. Vault is initialized by User
// 1.1 - Cannot initialize Vault for Someone else
// 2. User deposits the amount in Vault.
// 3. User can deposit multiple times in Vault
// 4. User can  deposit in Other's vault.
// 5. User can withdraw the amount
// 6. User can not withdrawa more than the Vault amount - Rent
// 6.1- User cannot withdraw from Other's Vault.
// 7. User can close the Valut and get the rent back.
// 8. User can close his Vault only.
// 9. 