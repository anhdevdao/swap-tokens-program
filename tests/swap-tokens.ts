import * as anchor from '@project-serum/anchor';
import { AnchorError, Program, BN } from '@project-serum/anchor';
import {
  Account,
  createMint,
  createAssociatedTokenAccount,
  mintToChecked,
  transfer,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
} from '@solana/spl-token';
import {
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
} from '@solana/web3.js';
import { SwapTokens } from '../target/types/swap_tokens';
import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import chai from 'chai';
import { expect } from 'chai';
import { IDL } from '../target/types/swap_tokens'

describe('swap-tokens', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;
  const program = anchor.workspace.SwapTokens as Program<SwapTokens>;
  const payer = (provider.wallet as any).payer;
  const payerAccount = payer.publicKey;

  let moveToken: PublicKey;
  let payerMoveTokenAccount: PublicKey;
  let poolAccount: PublicKey;
  let poolMoveTokenAccount: PublicKey;
  let poolOwner: PublicKey = payerAccount;
  let alice: Keypair = anchor.web3.Keypair.generate();
  let aliceMoveTokenAccount: PublicKey;

  let programInstance;

  it('Is init resources', async () => {
    moveToken = await createMint(
      connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      9
    );

    payerMoveTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      payer,
      moveToken,
      payerAccount
    );

    await mintToChecked(
      provider.connection,
      payer,
      moveToken,
      payerMoveTokenAccount,
      payer,
      1_000_000_000_000, // 1000 MOVE
      9
    );

    // Transfer SOL to Alice
    const transferTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: alice.publicKey,
        lamports: LAMPORTS_PER_SOL * 10,
      })
    );
    await sendAndConfirmTransaction(connection, transferTransaction, [payer]);

    aliceMoveTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      alice,
      moveToken,
      alice.publicKey
    );

    await mintToChecked(
      provider.connection,
      payer,
      moveToken,
      aliceMoveTokenAccount,
      payer,
      1_000_000_000_000, // 1000 MOVE
      9
    );
  });

  it('Cannot initialize with zero MOVE', async () => {
    [poolAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), payer.publicKey.toBuffer()],
      program.programId
    );

    let [tokenAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pool-move"), poolAccount.toBuffer()],
      program.programId
    );
    poolMoveTokenAccount = tokenAccount;

    // console.log("poolAccount", poolAccount.toBase58());
    // console.log("poolMoveTokenAccount", poolMoveTokenAccount.toBase58());
    // console.log("moveToken", moveToken.toBase58());

    try {
      await program.methods.initialize(
        new BN(10), // swap rate
        new BN(0), // 100 MOVE
      ).accounts({
        signer: payerAccount,
        signerTokenAccount: payerMoveTokenAccount,
        poolAccount,
        poolMoveTokenAccount,
        moveToken,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY
      }).rpc();

      // we use this to make sure we definitely throw an error
      chai.assert(false, "should've failed but didn't ")
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6001);
      expect(err.error.errorCode.code).to.equal("CannotAddLiquidityZero");
      expect(err.program.equals(program.programId)).is.true;
    }

    try {
      await program.methods.initialize(
        new BN(0), // swap rate
        new BN(100_000_000_000), // 100 MOVE
      ).accounts({
        signer: payerAccount,
        signerTokenAccount: payerMoveTokenAccount,
        poolAccount,
        poolMoveTokenAccount,
        moveToken,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY
      }).rpc();

      // we use this to make sure we definitely throw an error
      chai.assert(false, "should've failed but didn't ")
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6003);
      expect(err.error.errorCode.code).to.equal("InvalidSwapRate");
      expect(err.program.equals(program.programId)).is.true;
    }
  });

  it('Is initialized!', async () => {
    await program.methods.initialize(
      new BN(10), // swap rate
      new BN(100_000_000_000), // 100 MOVE
    ).accounts({
      signer: payerAccount,
      signerTokenAccount: payerMoveTokenAccount,
      poolAccount,
      poolMoveTokenAccount,
      moveToken,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY
    }).rpc();
    // let tokenAmount = await connection.getTokenAccountBalance(poolMoveTokenAccount);
    // console.log('Pool MOVE balance: ', tokenAmount);
    programInstance = new Program(
      IDL,
      new PublicKey(program.programId),
      provider
    );
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.totalSupply.toString()).to.be.equal('100000000000');
  });

  it('Call setSwapRate', async () => {
    await program.methods.setSwapRate(
      new BN(15)
    ).accounts({
      signer: payerAccount,
      poolAccount
    }).rpc();

    await program.methods.setSwapRate(
      new BN(10)
    ).accounts({
      signer: payerAccount,
      poolAccount
    }).rpc();
  });

  it('Only owner can call setSwapRate', async () => {
    try {
      await program.methods.setSwapRate(
        new anchor.BN(15)
      ).accounts({
        signer: alice.publicKey,
        poolAccount
      }).signers([alice]).rpc();

      // we use this to make sure we definitely throw an error
      chai.assert(false, "should've failed but didn't ")
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6006);
      expect(err.error.errorCode.code).to.equal("OnlyPoolOwner");
      expect(err.program.equals(program.programId)).is.true;
    }
  });

  it('Call setPaused', async () => {
    await program.methods.setPaused(
      true
    ).accounts({
      signer: payerAccount,
      poolAccount,
    }).rpc();

    await program.methods.setPaused(
      false
    ).accounts({
      signer: payerAccount,
      poolAccount,
    }).rpc();
  });

  it('Only owner can call setPaused', async () => {
    try {
      await program.methods.setPaused(
        true
      ).accounts({
        signer: alice.publicKey,
        poolAccount
      }).signers([alice]).rpc();

      // we use this to make sure we definitely throw an error
      chai.assert(false, "should've failed but didn't ")
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6006);
      expect(err.error.errorCode.code).to.equal("OnlyPoolOwner");
      expect(err.program.equals(program.programId)).is.true;
    }
  });

  it('Already paused', async () => {
    try {
      await program.methods.setPaused(
        false
      ).accounts({
        signer: payer.publicKey,
        poolAccount
      }).rpc();

      // we use this to make sure we definitely throw an error
      chai.assert(false, "should've failed but didn't ")
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6000);
      expect(err.error.errorCode.code).to.equal("AlreadyPausedOrUnpaused");
      expect(err.program.equals(program.programId)).is.true;
    }
  });

  it('Add liquidity', async () => {
    await program.methods.addLiquidity(
      new BN(10_000_000_000), // 10 MOVE
    ).accounts({
      signer: payerAccount,
      signerTokenAccount: payerMoveTokenAccount,
      poolAccount,
      poolMoveTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    let tokenAmount = await connection.getTokenAccountBalance(poolMoveTokenAccount);
    expect(tokenAmount.value.amount).to.be.equal('110000000000'); // 110 MOVE;
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.totalSupply.toString()).to.be.equal('110000000000');
  });

  it('Cannot add zero liquidity', async () => {
    try {
      await program.methods.addLiquidity(
        new BN(0),
      ).accounts({
        signer: payerAccount,
        signerTokenAccount: payerMoveTokenAccount,
        poolAccount,
        poolMoveTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      // we use this to make sure we definitely throw an error
      chai.assert(false, "should've failed but didn't ")
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6001);
      expect(err.error.errorCode.code).to.equal("CannotAddLiquidityZero");
      expect(err.program.equals(program.programId)).is.true;
    }
  });

  it('Anyone can add liquidity', async () => {
    await program.methods.addLiquidity(
      new BN(10_000_000_000), // 10 MOVE
    ).accounts({
      signer: alice.publicKey,
      signerTokenAccount: aliceMoveTokenAccount,
      poolAccount,
      poolMoveTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([alice]).rpc();
    let tokenAmount = await connection.getTokenAccountBalance(poolMoveTokenAccount);
    expect(tokenAmount.value.amount).to.be.equal('120000000000'); // 120 MOVE;
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.totalSupply.toString()).to.be.equal('120000000000');
  });

  it('Cannot add liquidity when program paused', async () => {
    await program.methods.setPaused(
      true
    ).accounts({
      signer: payerAccount,
      poolAccount,
    }).rpc();

    try {
      await program.methods.addLiquidity(
        new BN(10_000_000_000), // 10 MOVE
      ).accounts({
        signer: alice.publicKey,
        signerTokenAccount: aliceMoveTokenAccount,
        poolAccount,
        poolMoveTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).signers([alice]).rpc();

      // we use this to make sure we definitely throw an error
      chai.assert(false, "should've failed but didn't ")
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6005);
      expect(err.error.errorCode.code).to.equal("Paused");
      expect(err.program.equals(program.programId)).is.true;
    }

    await program.methods.setPaused(
      false
    ).accounts({
      signer: payerAccount,
      poolAccount,
    }).rpc();
  })

  it('Swap', async () => {
    let tokenBeforeAmount = await connection.getTokenAccountBalance(payerMoveTokenAccount);
    expect(tokenBeforeAmount.value.amount).to.be.equal('890000000000'); // 890 MOVE;
    // let balanceSolBefore = await connection.getBalance(poolAccount);
    // console.log(`${balanceSolBefore / LAMPORTS_PER_SOL} SOL`);
    // let balanceUserSolBefore = await connection.getBalance(poolOwner);
    // console.log(`${balanceUserSolBefore / LAMPORTS_PER_SOL} SOL`);
    await program.methods.swap(
      new BN(1_000_000_000), // 1 SOL
    ).accounts({
      signer: payerAccount,
      signerTokenAccount: payerMoveTokenAccount,
      poolAccount,
      poolMoveTokenAccount,
      fundingWallet: poolOwner,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc();
    // let balanceSolAfter = await connection.getBalance(poolAccount);
    // console.log(`${balanceSolAfter / LAMPORTS_PER_SOL} SOL`);
    // let balanceUserSolAfter = await connection.getBalance(poolOwner);
    // console.log(`${balanceUserSolAfter / LAMPORTS_PER_SOL} SOL`);
    let tokenAfterAmount = await connection.getTokenAccountBalance(payerMoveTokenAccount);
    expect(tokenAfterAmount.value.amount).to.be.equal('900000000000'); // 900 MOVE;
    let tokenAmount = await connection.getTokenAccountBalance(poolMoveTokenAccount);
    expect(tokenAmount.value.amount).to.be.equal('110000000000'); // 110 MOVE;
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.totalSupply.toString()).to.be.equal('110000000000');
  });

  it('Cannot swap zero', async () => {
    try {
      await program.methods.swap(
        new BN(0),
      ).accounts({
        signer: payerAccount,
        signerTokenAccount: payerMoveTokenAccount,
        poolAccount,
        poolMoveTokenAccount,
        fundingWallet: poolOwner,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      // we use this to make sure we definitely throw an error
      chai.assert(false, "should've failed but didn't ")
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6002);
      expect(err.error.errorCode.code).to.equal("CannotSwapZero");
      expect(err.program.equals(program.programId)).is.true;
    }
  });

  it('Anyone can swap', async () => {
    await program.methods.swap(
      new BN(1_000_000_000), // 1 SOL
    ).accounts({
      signer: alice.publicKey,
      signerTokenAccount: aliceMoveTokenAccount,
      poolAccount,
      poolMoveTokenAccount,
      fundingWallet: poolOwner,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([alice]).rpc();
    let tokenAmount = await connection.getTokenAccountBalance(poolMoveTokenAccount);
    expect(tokenAmount.value.amount).to.be.equal('100000000000'); // 100 MOVE;
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.totalSupply.toString()).to.be.equal('100000000000');
  });

  it('Cannot swap when program paused', async () => {
    await program.methods.setPaused(
      true
    ).accounts({
      signer: payerAccount,
      poolAccount,
    }).rpc();

    try {
      await program.methods.swap(
        new BN(1_000_000_000), // 1 SOL
      ).accounts({
        signer: alice.publicKey,
        signerTokenAccount: aliceMoveTokenAccount,
        poolAccount,
        poolMoveTokenAccount,
        fundingWallet: poolOwner,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).signers([alice]).rpc();

      // we use this to make sure we definitely throw an error
      chai.assert(false, "should've failed but didn't ")
    } catch (err) {
      expect(err).to.be.instanceOf(AnchorError);
      expect((err as AnchorError).error.errorCode.number).to.equal(6005);
      expect(err.error.errorCode.code).to.equal("Paused");
      expect(err.program.equals(program.programId)).is.true;
    }

    await program.methods.setPaused(
      false
    ).accounts({
      signer: payerAccount,
      poolAccount,
    }).rpc();
  })
});
