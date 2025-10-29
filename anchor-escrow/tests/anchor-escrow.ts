import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {createMint,mintTo, 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddressSync, 
  createAssociatedTokenAccountInstruction,
  getAccount,
  getMint
} from "@solana/spl-token"
import { AnchorEscrow } from "../target/types/anchor_escrow";

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
  const taker = anchor.web3.Keypair.generate();
  let mint_a:anchor.web3.PublicKey;
  let mint_b:anchor.web3.PublicKey;
  let maker_ata_a:anchor.web3.PublicKey;
  let taker_ata_b:anchor.web3.PublicKey;
  const seed = new anchor.BN(3113);
  let escrowPDA: anchor.web3.PublicKey;
  let escrowBump:number;
  let vault:anchor.web3.PublicKey;
  before(async ()=>{
    console.log(`Balance of Maker- ${await provider.connection.getBalance(maker)}`);
    await provider.connection.confirmTransaction(await provider.connection.requestAirdrop(taker.publicKey,1 * anchor.web3.LAMPORTS_PER_SOL));
    console.log(`Balance of Taker- ${await provider.connection.getBalance(taker.publicKey)}`);

    // minta , mintb ------------------------------------------
    let mint_a = await createMint(provider.connection,provider.wallet.payer,maker,null,2 );
    console.log(`mint_a ${mint_a}`);
    let mint_b = await createMint(provider.connection,provider.wallet.payer,taker.publicKey,null,3 );
    console.log(`mint_b ${mint_b}`);
    // -------------------------------------------------------------

    //Create maker_ata_a and mint tokens to it ----------------------
    const maker_ata_a = getAssociatedTokenAddressSync(mint_a,maker);
    const maker_ata_a_tx = new anchor.web3.Transaction().add(await createAssociatedTokenAccountInstruction(
      provider.wallet.publicKey,maker_ata_a,maker,mint_a)
    );
    await provider.sendAndConfirm(maker_ata_a_tx);
    await mintTo(provider.connection,provider.wallet.payer,mint_a,maker_ata_a,maker, 10000000);
    let maker_a_bal= await getTokenBalanceSpl(provider.connection, maker_ata_a).catch(err => console.log(err));
    console.log(`Maker ATA a Balance - ${maker_a_bal}`); 
    //----------------------------------------------------------------

   //Create taker_ata_b and mint tokens to it ----------------------
    const taker_ata_b = getAssociatedTokenAddressSync(mint_b,taker.publicKey);
    const taker_ata_b_tx = new anchor.web3.Transaction().add(await createAssociatedTokenAccountInstruction(
      provider.wallet.publicKey,taker_ata_b,taker.publicKey,mint_b)
    );
    await provider.sendAndConfirm(taker_ata_b_tx);
    await mintTo(provider.connection,provider.wallet.payer,mint_b,taker_ata_b,taker, 50000000);
    let taker_b_bal= await getTokenBalanceSpl(provider.connection, taker_ata_b).catch(err => console.log(err));
    console.log(`Taker ATA b Balance - ${taker_b_bal}`); 
    //----------------------------------------------------------------
    // Create seed, PDA, Vault Account
    
    const [escrowPDA,escrowBump]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("escrow"),maker.toBuffer(),seed.toArrayLike(Buffer,"le",8)
    ],program.programId);
    const vault = getAssociatedTokenAddressSync(mint_a,escrowPDA,true);
  });

  it("Is initialized!", async () => {
   // Add your test here.
    const tx = await program.methods.make(seed, new anchor.BN(2000),new anchor.BN(1000)
      )
      .accounts({
        maker:maker,
        mintA:mint_a,
        mintB:mint_b,
        makerAtaA:maker_ata_a,
        escrow:escrowPDA,
        vault:vault,
        associatedTokenProgram:ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram:TOKEN_PROGRAM_ID,
        systemProgram:anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
// ----------Helper Functions
// -------get SPL Token Balance
async function getTokenBalanceSpl(connection, tokenAccount) {
    const info = await getAccount(connection, tokenAccount);
    const amount = Number(info.amount);
    const mint = await getMint(connection, info.mint);
    const balance = amount / (10 ** mint.decimals);
    // console.log('Balance (using Solana-Web3.js): ', balance);
    return balance;
}

