import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NftEscrow } from "../target/types/nft_escrow";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID, // ← Metaplex uses regular TOKEN_PROGRAM, not TOKEN_2022
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import walletFile from "../../../.config/solana/id.json"; // ← Same wallet!
import keypairTaker from "../keypair1.json"; // ← Same wallet!

describe("nft-escrow", () => {
  // Use the SAME wallet that minted the NFT earlier-
  //// uncomment these for doing NFT escrow transfer- from payer to taker
  // const payer = anchor.web3.Keypair.fromSecretKey(new Uint8Array(walletFile));
  // const taker = anchor.web3.Keypair.fromSecretKey(new Uint8Array(keypairTaker));

  //// uncomment these to reverse the NFT escrow transfer- from taker to payer
  const taker = anchor.web3.Keypair.fromSecretKey(new Uint8Array(walletFile));
  const payer = anchor.web3.Keypair.fromSecretKey(new Uint8Array(keypairTaker));

  const connection = new anchor.web3.Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);

  const program = anchor.workspace.NftEscrow as Program<NftEscrow>;

  const nft_mint = new anchor.web3.PublicKey(
    "DoFgr6u1eqXGe9EBt99YkTgdZ1G4HL3XvVYqytBb851w"
  );

  const METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );
  const maker_nft_ata = getAssociatedTokenAddressSync(
    nft_mint,
    payer.publicKey,
    false,
    TOKEN_PROGRAM_ID
  );
  const taker_nft_ata = getAssociatedTokenAddressSync(
    nft_mint,
    taker.publicKey,
    false,
    TOKEN_PROGRAM_ID
  );
  const [escrow] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      payer.publicKey.toBuffer(),
      maker_nft_ata.toBuffer(),
    ],
    program.programId
  );

  const vault = getAssociatedTokenAddressSync(
    nft_mint,
    escrow,
    true,
    TOKEN_PROGRAM_ID
  );

  const [metadata_account] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      nft_mint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  const received = new anchor.BN(1.5 * anchor.web3.LAMPORTS_PER_SOL);
  it("NFT Vault Is initialized!", async () => {
    const tx = await program.methods
      .make(nft_mint, received)
      .accounts({
        maker: payer.publicKey,
        nftMint: nft_mint,
        makerNftAta: maker_nft_ata,
        vault: vault,
        metadata: metadata_account,
        metadataProgram: METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Transaction:", tx);
  });
  it("Taker Accepts the Offer to exchange NFT for lamports!", async () => {
    const tx = await program.methods
      .take()
      .accounts({
        maker: payer.publicKey,
        taker: taker.publicKey,
        nftMint: nft_mint,
        takerNftAta: taker_nft_ata,
        vault: vault,
        metadata: metadata_account,
        metadataProgram: METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([taker])
      .rpc();

    console.log("✅ Transaction:", tx);
  });
  // it("NFT Vault Is Refunded!", async () => {
  //   const tx = await program.methods
  //     .refund(nft_mint)
  //     .accounts({
  //       maker: payer.publicKey,
  //       nftMint: nft_mint,
  //       makerNftAta: maker_nft_ata,
  //       vault: vault,
  //       metadata: metadata_account,
  //       metadataProgram: METADATA_PROGRAM_ID,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     })
  //     .rpc();

  //   console.log("✅ Transaction:", tx);
  // });
});
