import { Connection, Keypair, PublicKey, type Commitment } from "@solana/web3.js";
import { 
    getAssociatedTokenAddress, 
    getOrCreateAssociatedTokenAccount, 
    mintTo,
    createAssociatedTokenAccountIdempotent,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
 } from "@solana/spl-token";
import wallet from "/home/nkbblocks/.config/solana/id.json" with {type:"json"};

let keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
console.log(`Wallet Public Key- ${keypair.publicKey}`);

let commitment:Commitment = "confirmed";
// let connection = new Connection("https://api.devnet.solana.com",commitment);  //for devnet
let connection = new Connection("http://localhost:8899",commitment); //for localnet

// let mint = new PublicKey("EDT4VRxdvHvyYKordZ7668hZ8bGGFVmhC3Us6dXzaPZW");
let mint = new PublicKey("63LT2rzQ87txRNp1jiKtiR1zSk5tfje23iQ1NcrnTcB6");

let decimals = 1_000_000;
// let user = Keypair.generate();

async function mintToUser(user:Keypair, mint:PublicKey, numToken:number) {
   
    try {
         // create ATA
        let ata = await createAssociatedTokenAccountIdempotent(
            connection,
            keypair,
            mint,
            user.publicKey,
            {commitment:"confirmed"},
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
            true
        );


        let txnSignature = await mintTo(
        connection,
        keypair,
        mint,
        ata,
        keypair,
        numToken * decimals,
        [],
        {commitment:"confirmed"},
        TOKEN_2022_PROGRAM_ID       
    );
    let txnSignatureLink= `https://explorer.solana.com/tx/${txnSignature}?cluster=devnet`
     console.log(`${numToken} Token Allocated to User- ${user.publicKey} and txnSignature is - ${txnSignatureLink}`);
    } catch (e) {
        console.log(`Error Occurred!- ${e}`)
    }
}
await mintToUser(keypair,mint,100000);

