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
  createAssociatedTokenAccountIdempotent
} from "@solana/spl-token";
import { TokenVault } from "../target/types/token_vault";

describe("token-vault", () => {
  
  // Configure the client to use the local cluster.
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  let owner = provider.wallet;

   let user = anchor.web3.Keypair.generate();// user will be minted Token

  const program = anchor.workspace.tokenVault as Program<TokenVault>;
  /*
  1. Make Anchor Provider wallet to owner.
  2. in Before hook, Mint Tokens 
  3. Create owner_ata_a and mint tokens to it
  3. Now Initialize Vault.
  */
  let mint: anchor.web3.PublicKey;
  let user_ata: anchor.web3.PublicKey;
  let vaultStatePDA: anchor.web3.PublicKey;
  let vaultStateBump: number;
  let vault: anchor.web3.PublicKey;
  const decimals = 1_000_000;
  before(async () => {
    // await airdrop(provider.connection, user.publicKey);
    // Minting Token
    mint = await createMint(
      provider.connection,
      owner.payer,
      owner.publicKey,
      null,
      6,
      user,
      {commitment:"confirmed"},
      TOKEN_2022_PROGRAM_ID
    );
    console.log(`mint ${mint}`);
    // //Creating User ATA to hold the minted Tokens
    // user_ata = getAssociatedTokenAddressSync(mint, user.publicKey,false,TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
   
    // console.log(`user_ata ${user_ata}`);
    // const user_ata_tx = new anchor.web3.Transaction().add(
    //    createAssociatedTokenAccountInstruction(
    //     owner.publicKey,
    //     user_ata,
    //     user.publicKey,
    //     mint,
    //     TOKEN_2022_PROGRAM_ID,
    //     ASSOCIATED_TOKEN_PROGRAM_ID
    //   )
    // );
    // const tx =  await provider.sendAndConfirm(user_ata_tx);
    // console.log(`user_ata_tx ${tx}`);
     user_ata = await createAssociatedTokenAccountIdempotent(
            provider.connection,
            owner.payer,
            mint,
            user.publicKey,
            {commitment:"confirmed"},
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
            true
        );
        console.log(`user_ata ${user_ata}`);
    // // Mint Tokens to User Account
    const mintTx = await mintTo(
      provider.connection,
      owner.payer,
      mint,
      user_ata,
      owner.payer,
      1000000 *decimals,
      [],
      {commitment:"confirmed"},
      TOKEN_2022_PROGRAM_ID
    );
    console.log(`MintTo Txn- ${mintTx}`);
    // Create seed, PDA, Vault Account
    [vaultStatePDA, vaultStateBump] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("state"), user.publicKey.toBuffer()],
        program.programId
      );
    vault = getAssociatedTokenAddressSync(mint, vaultStatePDA, true,TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

    let owner_bal = await getTokenBalanceSpl(
      provider.connection,
      user_ata
    ).catch((err) => console.log(err));
    console.log(`Owner Token Balance-Initially- - ${owner_bal}`);
  });
  it("Token Vault is initialized!", async () => {
    const tx = await program.methods
      .initialize()
      .accountsStrict({
        owner: user.publicKey,
        mint: mint,
        vault,
        vaultState: vaultStatePDA,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).signers([user])
      .rpc();
    console.log("Your transaction signature", tx);
  });


  it("Deposit Token in Vault!", async () => {
    
    const tx = await program.methods
      .deposit(new anchor.BN(10000 * decimals))
      .accountsStrict({
        owner: user.publicKey,
        ownerAta: user_ata,
        mint: mint,
        vault,
        vaultState: vaultStatePDA,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).signers([user])
      .rpc();
    console.log("Your transaction signature", tx);

    let owner_bal = await getTokenBalanceSpl(
      provider.connection,
      user_ata
    ).catch((err) => console.log(err));
    console.log(`Owner Token Balance after deposit - ${owner_bal}`);

    let vault_bal = await getTokenBalanceSpl(provider.connection, vault).catch(
      (err) => console.log(err)
    );
    console.log(`Vault Token Balance - ${vault_bal}`);
    console.log(`Vault Address - ${vault}`);
  });


  it("Withdraw Some Tokens from Vault!", async () => {
    const tx = await program.methods
      .withdraw(new anchor.BN(4000*decimals))
      .accountsStrict({
        owner: user.publicKey,
        ownerAta: user_ata,
        mint: mint,
        vault,
        vaultState: vaultStatePDA,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).signers([user])
      .rpc();
    console.log("Your transaction signature", tx);

    let owner_bal = await getTokenBalanceSpl(
      provider.connection,
      user_ata
    ).catch((err) => console.log(err));
    console.log(`Owner Token Balance-after 4000 withdrawal from Vault  - ${owner_bal}`);

    let vault_bal = await getTokenBalanceSpl(provider.connection, vault).catch(
      (err) => console.log(err)
    );
    console.log(`Vault Token Balance after 4000 withdrawal - ${vault_bal}`);
  });
});

// -------get SPL Token Balance
async function getTokenBalanceSpl(connection, tokenAccount) {
  const info = await getAccount(connection, tokenAccount,"confirmed",TOKEN_2022_PROGRAM_ID);
  const amount = Number(info.amount);
  const mint = await getMint(connection, info.mint,"confirmed",TOKEN_2022_PROGRAM_ID);
  const balance = amount / 10 ** mint.decimals;
  return balance;
}
// ---------airdrop sol
async function airdrop(connection: any, address: any, amount = 100 * anchor.web3.LAMPORTS_PER_SOL) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}