import { Connection, Keypair, PublicKey, type Commitment } from "@solana/web3.js";
import { getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import wallet from "/home/nkb/.config/solana/id.json" with {type:"json"};

let keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
console.log(`Wallet Public Key- ${keypair.publicKey}`);

let commitment:Commitment = "confirmed";
let connection = new Connection("https://api.devnet.solana.com",commitment);

let mint = new PublicKey("Ahx9ssjAyFCvncH46X21Kfzy7LWKgf1zwmHt7Fmc8yZB");
let decimals = 1_000_000;
// let user = Keypair.generate();

async function mintToUser(user:Keypair, numToken:number) {
    // create ATA
    let ata = await getOrCreateAssociatedTokenAccount(connection,keypair,mint,user.publicKey);
    // Mint to ATA
    try {
        let txnSignature = await mintTo(
        connection,
        keypair,
        mint,
        ata.address,
        keypair,
        numToken * decimals
    );
    let txnSignatureLink= `https://solscan.io/tx/${txnSignature}?cluster=devnet`
     console.log(`${numToken} Token Allocated to User- ${user.publicKey} and txnSignature is - ${txnSignatureLink}`);
    } catch (e) {
        console.log(`Error Occurred!- ${e}`)
    }
}
await mintToUser(keypair,100000);
console.log(`spl_mint`);
