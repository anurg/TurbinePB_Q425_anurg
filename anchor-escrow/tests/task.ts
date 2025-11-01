import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  createMint,
  mintTo,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getMint,
  TOKEN_2022_PROGRAM_ID
} from "@solana/spl-token";
import { AnchorEscrow } from "../target/types/anchor_escrow";
import * as fs from "fs";
import * as path from "path";
const KEYPAIR_PATH = path.join(__dirname, "taker-keypair.json");
describe("anchor-escrow", () => {
  // Configure the client to use the local cluster.
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.anchorEscrow as Program<AnchorEscrow>;

  //  ------------------- //
  //  Steps to testing-
  // 1. create Maker & Taker wallet
  // 2. Mint Token a & b
  // 3. Airdrop lamports to Maker, Taker wallets
  // 4. genreate ATAs-  maker ATA a , maker ATA b, taker ATA a, Taker ATA b address
  // 5. Mint Tokens to ATA- mintTo
  // 6. generate escrow PDA
  // 6. generate Vault Token Account
  // 7.
  //----------------------//
  const maker = provider.wallet.publicKey;
    // const taker = anchor.web3.Keypair.generate();
  const taker = loadOrGenerateKeypair();
  
  console.log(`Taker: - ${taker.publicKey}`);
  let mint_a: anchor.web3.PublicKey;
  let mint_b: anchor.web3.PublicKey;
  let maker_ata_a: anchor.web3.PublicKey;
  let maker_ata_b: anchor.web3.PublicKey;
  let taker_ata_a: anchor.web3.PublicKey;
  let taker_ata_b: anchor.web3.PublicKey;
  const seed = new anchor.BN(3110);
  let escrowPDA: anchor.web3.PublicKey;
  let escrowBump: number;
  let vault: anchor.web3.PublicKey;
  const decimals = 1_000_000;
  before(async () => {
    // await airdrop(provider.connection,taker.publicKey);  //comment in Devnet
    console.log(
      `Balance of Maker- ${await provider.connection.getBalance(maker)}`
    );
    console.log(
      `Balance of Taker- ${await provider.connection.getBalance(
        taker.publicKey
      )}`
    );

    // minta , mintb ------------------------------------------
    mint_a = new anchor.web3.PublicKey(
      "EDT4VRxdvHvyYKordZ7668hZ8bGGFVmhC3Us6dXzaPZW"
    );
    console.log(`mint_a ${mint_a}`);
    // Verify the mint exists
    try {
      const mintInfo = await getMint(
        provider.connection,
        mint_a,
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
    mint_b = await createMint(
      provider.connection,
      taker,
      taker.publicKey,
      null,
      6,
      undefined,
      { commitment: "confirmed" },
      TOKEN_2022_PROGRAM_ID
    );
    console.log(`mint_b ${mint_b}`);
    // -------------------------------------------------------------

    //Create maker_ata_a and mint tokens to it ----------------------
    maker_ata_a = getAssociatedTokenAddressSync(mint_a, maker,false,TOKEN_2022_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID);
    maker_ata_b = getAssociatedTokenAddressSync(mint_b, maker,false,TOKEN_2022_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID);
    //

    let maker_a_bal = await getTokenBalanceSpl(
      provider.connection,
      maker_ata_a
    ).catch((err) => console.log(err));
    console.log(`Maker ATA a Balance - ${maker_a_bal}`);
    //----------------------------------------------------------------

    //Create taker_ata_b and mint tokens to it ----------------------
    taker_ata_a = getAssociatedTokenAddressSync(mint_a, taker.publicKey,false,TOKEN_2022_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID);
    taker_ata_b = getAssociatedTokenAddressSync(mint_b, taker.publicKey,false,TOKEN_2022_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID);
    const taker_ata_b_tx = new anchor.web3.Transaction().add(
      await createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        taker_ata_b,
        taker.publicKey,
        mint_b,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
    await provider.sendAndConfirm(taker_ata_b_tx);
    await mintTo(
      provider.connection,
      taker,
      mint_b,
      taker_ata_b,
      taker,
      50000 * decimals,
      [],
      {commitment:"confirmed"},
      TOKEN_2022_PROGRAM_ID
    );
    let taker_b_bal = await getTokenBalanceSpl(
      provider.connection,
      taker_ata_b
    ).catch((err) => console.log(err));
    console.log(`Taker ATA b Balance - ${taker_b_bal}`);
    //----------------------------------------------------------------
    // Create seed, PDA, Vault Account

    [escrowPDA, escrowBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        maker.toBuffer(),
        seed.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
    vault = getAssociatedTokenAddressSync(mint_a, escrowPDA, true,TOKEN_2022_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID);
  });

  it("Make an Offer!", async () => {
    const tx = await program.methods
      .make(
        seed,
        new anchor.BN(2000 * decimals),
        new anchor.BN(1000 * decimals)
      )
      .accounts({
        maker: maker,
        mintA: mint_a,
        mintB: mint_b,
        makerAtaA: maker_ata_a,
        escrow: escrowPDA,
        vault: vault,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);
        const ATAA = (
      await provider.connection.getTokenAccountBalance(
        maker_ata_a
      )
    ).value.amount;
    console.log(`The amount in Maker ATA -a after Offer is taken: ${ATAA}`);
    const vaultBalance = (
      await provider.connection.getTokenAccountBalance(vault)
    ).value.amount;
    console.log(`The amount in Vault is ${vaultBalance}`);


  });

  //   it("Refund Offer!", async () => {
  //     const tx = await program.methods
  //       .refund()
  //       .accounts({
  //         maker: maker,
  //         mintA: mint_a,
  //         makerAtaA: maker_ata_a,
  //         escrow: escrowPDA,
  //         vault: vault,
  //         associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       })
  //       .rpc();
  //     console.log("Your transaction signature", tx);
  //     const ATAA = (await provider.connection.getTokenAccountBalance(maker_ata_a))
  //       .value.amount;
  //     console.log(`The amount in Maker ATA-a after refund is ${ATAA}`);
  //   });

  it("Take Offer!", async () => {
    const tx = await program.methods
      .take()
      .accountsStrict({
        taker: taker.publicKey,
        maker: maker,
        mintA: mint_a,
        mintB: mint_b,
        makerAtaA: maker_ata_a,
        makerAtaB: maker_ata_b,
        takerAtaA: taker_ata_a,
        takerAtaB: taker_ata_b,
        escrow: escrowPDA,
        vault: vault,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([taker])
      .rpc();
    console.log("Your transaction signature", tx);
    const ATAAA = (
      await provider.connection.getTokenAccountBalance(maker_ata_a)
    ).value.amount;
    console.log(`The amount in Maker ATA-a after Offer is taken: ${ATAAA}`);

    const ATAB = (
      await provider.connection.getTokenAccountBalance(maker_ata_b)
    ).value.amount;
    console.log(`The amount in Maker ATA -b after Offer is taken: ${ATAB}`);
  });
});

// ----------Helper Functions
// -------get SPL Token Balance
async function getTokenBalanceSpl(connection, tokenAccount) {
  const info = await getAccount(connection, tokenAccount,"confirmed",TOKEN_2022_PROGRAM_ID);
  const amount = Number(info.amount);
  const mint = await getMint(connection, info.mint,"confirmed",TOKEN_2022_PROGRAM_ID);
  const balance = amount / 10 ** mint.decimals;
  // console.log('Balance (using Solana-Web3.js): ', balance);
  return balance;
}

function loadOrGenerateKeypair(): anchor.web3.Keypair {
  try {
    // Try to load existing keypair
    if (fs.existsSync(KEYPAIR_PATH)) {
      const keypairData = JSON.parse(fs.readFileSync(KEYPAIR_PATH, "utf-8"));
      const secretKey = Uint8Array.from(keypairData);
      const keypair = anchor.web3.Keypair.fromSecretKey(secretKey);
      console.log("Loaded existing keypair from file");
      console.log("Public key:", keypair.publicKey.toBase58());
      return keypair;
    }
  } catch (error) {
    console.error("Error loading keypair:", error);
  }

  // Generate new keypair if file doesn't exist or loading failed
  //   console.log("Generating new keypair...");
  //   const keypair = anchor.web3.Keypair.generate();

  //   // Save to file
  //   try {
  //     fs.writeFileSync(
  //       KEYPAIR_PATH,
  //       JSON.stringify(Array.from(keypair.secretKey)),
  //       "utf-8"
  //     );
  //     console.log("Keypair saved to", KEYPAIR_PATH);
  //     console.log("Public key:", keypair.publicKey.toBase58());
  //   } catch (error) {
  //     console.error("Error saving keypair:", error);
  //   }

  //   return keypair;
}
// ---------airdrop sol
async function airdrop(
  connection: any,
  address: any,
  amount = 100 * anchor.web3.LAMPORTS_PER_SOL
) {
  await connection.confirmTransaction(
    await connection.requestAirdrop(address, amount),
    "confirmed"
  );
}