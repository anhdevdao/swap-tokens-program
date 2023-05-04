import { web3 } from "@project-serum/anchor";
import { getAssociatedTokenAddress } from '@solana/spl-token';
require("dotenv").config();

async function createMoveBalance() {
  const connection = new web3.Connection(
    process.env.RPC,
    "processed"
  );

  let tokenAmount = await connection.getTokenAccountBalance(new web3.PublicKey(process.env.OWNER_TOKEN_ACCOUNT));

  console.log({
    tokenAmount: tokenAmount,
  });

  let tokenAccount = await getAssociatedTokenAddress(
    new web3.PublicKey(process.env.MOVE_TOKEN),
    new web3.PublicKey(process.env.OWNER)
  );

  let account = await connection.getAccountInfo(tokenAccount)
  console.log(account);

  // if (account == null) {
  //   await createAssociatedTokenAccount(
  //     connection,
  //     authority,
  //     moveToken,
  //     authority.publicKey
  //   );
  // }
}

createMoveBalance();