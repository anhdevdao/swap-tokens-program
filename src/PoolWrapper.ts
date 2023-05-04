import { BN, Provider, Program, Wallet, web3 } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { ASSOCIATED_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SwapTokens } from '../target/types/swap_tokens';
require('dotenv').config()

export class PoolWrapper {
  private readonly connection: web3.Connection;
  private readonly provider: Provider;

  public static POOL_SEED = Buffer.from("pool");
  public static POOL_MOVE_SEED = Buffer.from("pool-move");

  constructor(
    public readonly program: Program<SwapTokens>,
    private readonly wallet: Wallet
  ) {
    this.connection = this.program.provider.connection;
    this.provider = this.program.provider;
  }

  public async getPoolAccount() {
    return web3.PublicKey.findProgramAddressSync(
      [PoolWrapper.POOL_SEED, (new PublicKey(process.env.OWNER)).toBuffer()],
      this.program.programId
    )
  }

  public async getPoolMoveTokenAccount(poolAccount: web3.PublicKey) {
    return web3.PublicKey.findProgramAddressSync(
      [PoolWrapper.POOL_MOVE_SEED, poolAccount.toBuffer()],
      this.program.programId
    )
  }

  public async initializePool(params: {
    moveToken: web3.PublicKey,
    swapRate: BN,
    moveAmount: BN,
  }) {
    const [poolAccount] = await this.getPoolAccount();
    const [poolMoveTokenAccount] = await this.getPoolMoveTokenAccount(
      poolAccount
    );

    const signerTokenAccount = await getAssociatedTokenAddress(
      params.moveToken,
      this.wallet.publicKey
    );

    return await this.program.methods.initialize(
      params.swapRate,
      params.moveAmount
    ).accounts({
      signer: this.wallet.publicKey,
      signerTokenAccount,
      poolAccount,
      poolMoveTokenAccount,
      moveToken: params.moveToken,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: web3.SYSVAR_RENT_PUBKEY
    }).rpc();
  }

  public async addLiquidity(params: {
    moveToken: web3.PublicKey,
    swapRate: BN,
    moveAmount: BN,
  }) {
    const [poolAccount] = await this.getPoolAccount();
    const [poolMoveTokenAccount] = await this.getPoolMoveTokenAccount(
      poolAccount
    );
    
    const poolAccountInfo = await this.program.account["pool"].fetch(process.env.POOL_ACCOUNT);

    const signerTokenAccount = await getAssociatedTokenAddress(
      poolAccountInfo.moveToken,
      this.wallet.publicKey
    );

    return await this.program.methods.addLiquidity(
      params.moveAmount
    ).accounts({
      signer: this.wallet.publicKey,
      signerTokenAccount,
      poolAccount,
      poolMoveTokenAccount,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc();
  }

  public async setSwapRate(params: {
    swapRate: BN,
  }) {
    const [poolAccount] = await this.getPoolAccount();

    return await this.program.methods.setSwapRate(
      params.swapRate,
    ).accounts({
      signer: this.wallet.publicKey,
      poolAccount,
    }).rpc();
  }

  public async setPaused(params: {
    paused: boolean,
  }) {
    const [poolAccount] = await this.getPoolAccount();

    return await this.program.methods.setPaused(
      params.paused,
    ).accounts({
      signer: this.wallet.publicKey,
      poolAccount,
    }).rpc();
  }

  public async swap(params: {
    lamports: BN,
  }) {
    const [poolAccount] = await this.getPoolAccount();
    const [poolMoveTokenAccount] = await this.getPoolMoveTokenAccount(
      poolAccount
    );

    const poolAccountInfo = await this.program.account["pool"].fetch(process.env.POOL_ACCOUNT);

    const signerTokenAccount = await getAssociatedTokenAddress(
      poolAccountInfo.moveToken,
      this.wallet.publicKey
    );

    return await this.program.methods.swap(
      params.lamports,
    ).accounts({
      signer: this.wallet.publicKey,
      signerTokenAccount,
      poolAccount,
      poolMoveTokenAccount,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc();
  }
}