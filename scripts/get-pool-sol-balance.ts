import { web3 } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
require("dotenv").config();

async function getPoolSolBalance() {
  const connection = new web3.Connection(
    process.env.RPC,
    "processed"
  );

  let balanceSol = await connection.getBalance(new web3.PublicKey(process.env.POOL_ACCOUNT));
  console.log(`${balanceSol / LAMPORTS_PER_SOL} SOL`);
}

getPoolSolBalance();