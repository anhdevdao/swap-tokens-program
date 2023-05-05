import { web3 } from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { mintToChecked } from '@solana/spl-token';
require("dotenv").config();

async function mintMoveToken(tokenAccount: web3.PublicKey) {
    const connection = new web3.Connection(
        process.env.RPC,
        "processed"
    );
    const authority = web3.Keypair.fromSecretKey(
        bs58.decode(process.env.SECRET_KEY)
    );

    const moveToken = new web3.PublicKey(process.env.MOVE_TOKEN);

    await mintToChecked(
      connection,
      authority,
      moveToken,
      tokenAccount,
      authority,
      1_000_000_000_000_000, // 1_000,000 MOVE
      9
    );

    console.log(`Mint to ${tokenAccount} 1,000,000 MOVE`);
}

mintMoveToken(new web3.PublicKey(process.env.OWNER_TOKEN_ACCOUNT));