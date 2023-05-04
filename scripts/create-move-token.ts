import { web3 } from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {
  createMint,
} from '@solana/spl-token';
require("dotenv").config();

async function createMoveToken() {
  const connection = new web3.Connection(
    process.env.RPC,
    "processed"
  );
  const authority = web3.Keypair.fromSecretKey(
    bs58.decode(process.env.SECRET_KEY)
  );

  const moveToken = await createMint(
    connection,
    authority,
    authority.publicKey,
    authority.publicKey,
    9
  );

  console.log({
    moveToken,
  })
}

createMoveToken();