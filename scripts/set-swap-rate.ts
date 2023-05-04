import { AnchorProvider, BN, Program, web3 } from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { IDL } from "../target/types/swap_tokens";
import { PublicKey } from "@solana/web3.js";
import { PoolWrapper } from "../src/PoolWrapper";
require("dotenv").config();

async function setSwapRate() {
  const connection = new web3.Connection(
    process.env.RPC,
    "processed"
  );
  const authority = web3.Keypair.fromSecretKey(
    bs58.decode(process.env.SECRET_KEY)
  );

  const authorityWallet = new NodeWallet(authority);
  const provider = new AnchorProvider(connection, authorityWallet, {
    preflightCommitment: "processed",
    commitment: "processed"
  });

  const program = new Program(
    IDL,
    new PublicKey(process.env.PROGRAM_ID),
    provider
  )

  const wrapper = new PoolWrapper(program, authorityWallet);

  const sentSignature = await wrapper.setSwapRate({
    swapRate: new BN(10),
  });

  console.log({
    setSwapRateSignature: sentSignature,
  })
}

setSwapRate();