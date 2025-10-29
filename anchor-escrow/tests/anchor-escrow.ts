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

  before(async ()=>{

    console.log(`Balance of Maker- ${await provider.connection.getBalance(maker)}`);
    await provider.connection.confirmTransaction(await provider.connection.requestAirdrop(taker.publicKey,1 * anchor.web3.LAMPORTS_PER_SOL));
    console.log(`Balance of Taker- ${await provider.connection.getBalance(taker.publicKey)}`);

    // minta , mintb ------------------------------------------
    let mint_a = await createMint(provider.connection,provider.wallet.payer,maker,null,2 );
    console.log(`mint_a ${mint_a}`);
    let mint_b = await createMint(provider.connection,provider.wallet.payer,taker.publicKey,null,2 );
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
   

  });

  it("Is initialized!", async () => {

    // Add your test here.
    // const tx = await program.methods.initialize(
    //   new anchor.BN(1111), 
    //   new anchor.BN(100),
    //   new anchor.BN(200))
    //   .accountsPartial(

    //   )
    //   .rpc();
    // console.log("Your transaction signature", tx);
  });
});

async function getTokenBalanceSpl(connection, tokenAccount) {
    const info = await getAccount(connection, tokenAccount);
    const amount = Number(info.amount);
    const mint = await getMint(connection, info.mint);
    const balance = amount / (10 ** mint.decimals);
    console.log('Balance (using Solana-Web3.js): ', balance);
    return balance;
}

