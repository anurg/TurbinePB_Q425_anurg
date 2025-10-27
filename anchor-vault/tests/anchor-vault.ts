import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorVault } from "../target/types/anchor_vault";
import { assert } from "chai";

describe("anchor-vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.anchorVault as Program<AnchorVault>;
  let alice = anchor.web3.Keypair.generate();
  const bob = anchor.web3.Keypair.generate();
  const jeff = anchor.web3.Keypair.generate();

  // PDA function
  function getVaultStatePDA(
    vaultAuthority: anchor.web3.PublicKey
  ): anchor.web3.PublicKey {
    const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state"), vaultAuthority.toBuffer()],
      program.programId
    );
    return pda;
  }

  function getVaultPDA(
    vaultAuthority: anchor.web3.PublicKey
  ): anchor.web3.PublicKey {
    const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), vaultAuthority.toBuffer()],
      program.programId
    );
    return pda;
  }

  const aliceVaultStatePDA = getVaultStatePDA(alice.publicKey);
  const aliceVaultPDA = getVaultPDA(aliceVaultStatePDA);

  const bobVaultStatePDA = getVaultStatePDA(bob.publicKey);
  const bobVaultPDA = getVaultPDA(bobVaultStatePDA);

  const jeffVaultStatePDA = getVaultStatePDA(jeff.publicKey);
  const jeffVaultPDA = getVaultPDA(jeffVaultStatePDA);

  // airdrop function
  async function airdrop(
    connection: any,
    address: anchor.web3.PublicKey,
    amount = 50 * anchor.web3.LAMPORTS_PER_SOL
  ) {
    await connection.confirmTransaction(
      await connection.requestAirdrop(address, amount),
      "confirmed"
    );
  }
  it("Alice initialize her Vault!", async () => {
    await airdrop(provider.connection, alice.publicKey);
    const tx = await program.methods
      .initialize()
      .accounts({
        user: alice.publicKey,
      })
      .signers([alice])
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Alice deposits in her Vault!", async () => {
    const tx = await program.methods
      .deposit(new anchor.BN(1000_000_000))
      .accounts({
        user: alice.publicKey,
      })
      .signers([alice])
      .rpc();
    console.log("Your transaction signature", tx);
  });
  it("Alice deposits multiple times in her Vault!", async () => {
    const tx = await program.methods
      .deposit(new anchor.BN(1000_000_000))
      .accounts({
        user: alice.publicKey,
      })
      .signers([alice])
      .rpc();
    console.log("Your transaction signature", tx);
    const tx1 = await program.methods
      .deposit(new anchor.BN(1000_000_000))
      .accounts({
        user: alice.publicKey,
      })
      .signers([alice])
      .rpc();
    console.log("Your transaction signature", tx1);
    const tx2 = await program.methods
      .deposit(new anchor.BN(1000_000_000))
      .accounts({
        user: alice.publicKey,
      })
      .signers([alice])
      .rpc();
    console.log("Your transaction signature", tx2);
  });

  it("Alice tries to initialize Vault for Bob(Should Fail)", async () => {
    try {
      const tx = await program.methods
        .initialize()
        .accounts({
          user: bob.publicKey,
        })
        .signers([alice])
        .rpc();
      console.log("Your transaction signature", tx);
    } catch (error) {
      assert.isTrue(
        error.toString().includes("Error"),
        "Should fail as Alice cannot initialize Vault for Bob!"
      );
    }
  });
  it("Bob initialize his Vault!", async () => {
    await airdrop(provider.connection, bob.publicKey);
    const tx = await program.methods
      .initialize()
      .accounts({
        user: bob.publicKey,
      })
      .signers([bob])
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Alice deposits in Bob's Vault!(Should Fail)", async () => {
    try {
      const tx = await program.methods
        .deposit(new anchor.BN(1_000_000_00))
        .accounts({
          user: bob.publicKey,
        })
        .signers([alice])
        .rpc();
      console.log("Your transaction signature", tx);
    } catch (error) {
      assert.isTrue(
        error.toString().includes("Error"),
        "Should fail as Alice's PDA is differenet- cannot deposit in Bob's Vault!"
      );
    }
  });

  it("Alice withdraws from her Vault!", async () => {
    const tx = await program.methods
      .withdraw(new anchor.BN(1000))
      .accounts({
        user: alice.publicKey,
      })
      .signers([alice])
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Alice try to withdraw from Bob's Vault!(Should fail)", async () => {
    try {
      const tx = await program.methods
        .withdraw(new anchor.BN(10))
        .accounts({
          user: bob.publicKey,
        })
        .signers([alice])
        .rpc();
      console.log("Your transaction signature", tx);
    } catch (error) {
      assert.isTrue(
        error.toString().includes("Error"),
        "Should fail as only Vault owner can withdraw from Vault!"
      );
    }
  });
});

// Test Cases for Vault
// 1. Vault is initialized by User
// 2. Cannot initialize Vault for Someone else
// 3. User deposits the amount in Vault.
// 4. User cannot  deposit in Other's vault.
// 5. User can withdraw the amount
// 6. User can not withdrawa more than the Vault amount - Rent
// 6.1- User cannot withdraw from Other's Vault.
// 7. User can close the Valut and get the rent back.
// 8. User can close his Vault only.
