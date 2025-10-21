import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HelloSolana } from "../target/types/hello_solana";

describe("hello_solana", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.helloSolana as Program<HelloSolana>;

  const signer = anchor.web3.Keypair.generate();
  const user = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    // Add your test here.
    await airdrop(program.provider.connection, signer.publicKey);
    const tx = await program.methods
      .initialize("Anurag")
      .accounts({
        signer: signer.publicKey,
        userAccount: user.publicKey,
      })
      .signers([signer, user])
      .rpc();

    console.log("Your transaction signature", tx);
  });
});
async function airdrop(connection: any, address: any, amount = 1000000000) {
  await connection.confirmTransaction(
    await connection.requestAirdrop(address, amount),
    "confirmed"
  );
}
