import { web3 } from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {
  createAssociatedTokenAccount,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
require("dotenv").config();

async function createOrGetAssociatedAccount() {
  const connection = new web3.Connection(
    process.env.RPC,
    "processed"
  );

  const authority = web3.Keypair.fromSecretKey(
    bs58.decode(process.env.SECRET_KEY)
  );

  const moveToken = new web3.PublicKey(
    process.env.MOVE_TOKEN
  );

  let tokenAccount = await getAssociatedTokenAddress(
    moveToken,
    authority.publicKey
  );

  let account = await connection.getAccountInfo(tokenAccount)

  if (account == null) {
    await createAssociatedTokenAccount(
      connection,
      authority,
      moveToken,
      authority.publicKey
    );
  }

  console.log({ tokenAccount });
}

createOrGetAssociatedAccount();