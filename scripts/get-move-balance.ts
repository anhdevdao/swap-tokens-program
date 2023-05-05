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
    tokenAmount: tokenAmount.value.uiAmount,
  });
}

createMoveBalance();