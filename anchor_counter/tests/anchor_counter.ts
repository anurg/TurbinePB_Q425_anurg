import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorCounter } from "../target/types/anchor_counter";
import { it } from "mocha";
import { expect } from "chai";

describe("anchor_counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.anchorCounter as Program<AnchorCounter>;
  const counter = anchor.web3.Keypair.generate();
  it("Counter Initialized", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        counter: counter.publicKey,
      })
      .signers([counter])
      .rpc();
    const account = await program.account.counter.fetch(counter.publicKey);
    expect(account.count == 0);
  });
  it("Counter incremented", async () => {
    const tx = await program.methods
      .increment()
      .accounts({
        counter: counter.publicKey,
        user: provider.wallet.publicKey,
      })
      .rpc();
    const account = await program.account.counter.fetch(counter.publicKey);
    expect(account.count == 1);
  });
  it("Counter decremented", async () => {
    const tx = await program.methods
      .increment()
      .accounts({
        counter: counter.publicKey,
        user: provider.wallet.publicKey,
      })
      .rpc();
    const account = await program.account.counter.fetch(counter.publicKey);
    expect(account.count == 0);
  });
});
