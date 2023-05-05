import * as anchor from '@project-serum/anchor';
import { AnchorError, Program, BN } from '@project-serum/anchor';
import {
  createMint,
  createAssociatedTokenAccount,
  mintToChecked,
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
  let alice: Keypair = anchor.web3.Keypair.generate();
  let aliceMoveTokenAccount: PublicKey;
  let bob: Keypair = anchor.web3.Keypair.generate();
  let bobMoveTokenAccount: PublicKey;

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
      100_000_000_000_000, // 100,000 MOVE
      9
    );

    // Transfer 10 SOL to Alice
    const transferAliceTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: alice.publicKey,
        lamports: LAMPORTS_PER_SOL * 10,
      })
    );
    await sendAndConfirmTransaction(connection, transferAliceTransaction, [payer]);
    // Transfer 10 SOL to Bob
    const transferBobTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: bob.publicKey,
        lamports: LAMPORTS_PER_SOL * 10,
      })
    );
    await sendAndConfirmTransaction(connection, transferBobTransaction, [payer]);

    aliceMoveTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      alice,
      moveToken,
      alice.publicKey
    );
    bobMoveTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      bob,
      moveToken,
      bob.publicKey
    );

    await mintToChecked(
      provider.connection,
      payer,
      moveToken,
      aliceMoveTokenAccount,
      payer,
      10_000_000_000_000, // 10,000 MOVE
      9
    );
    await mintToChecked(
      provider.connection,
      payer,
      moveToken,
      bobMoveTokenAccount,
      payer,
      10_000_000_000_000, // 10,000 MOVE
      9
    );
  });

  it('Cannot initialize with zero SOL', async () => {
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
        new BN(0), // 0 SOL
        new BN(1_000_000_000), // 1 MOVE
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
  });

  it('Cannot initialize with zero MOVE or swap rate', async () => {
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
        new BN(1_000_000_000), // 1 SOL
        new BN(0), // 0 MOVE
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
        new BN(1_000_000_000), // 1 SOL
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

  // Owner: 100,000 MOVE
  // Alice: 10 SOL - 10,000 MOVE
  // Bob: 10 SOL - 10,000 MOVE

  it('Is initialized!', async () => {
    await program.methods.initialize(
      new BN(10), // swap rate
      new BN(1_000_000_000), // 1 SOL
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
    programInstance = new Program(
      IDL,
      new PublicKey(program.programId),
      provider
    );
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.solTotalSupply.toString()).to.be.equal('1000000000');
    expect(poolAccountInfo.moveTotalSupply.toString()).to.be.equal('100000000000');
  });

  // Owner: 99,900 MOVE
  // Alice: 10 SOL - 10,000 MOVE
  // Bob: 10 SOL - 10,000 MOVE
  // Pool: 1 SOL - 100 MOVE

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
      expect((err as AnchorError).error.errorCode.number).to.equal(6007);
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
      expect((err as AnchorError).error.errorCode.number).to.equal(6007);
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
      new BN(1_000_000_000), // 1 SOL
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
    expect(poolAccountInfo.solTotalSupply.toString()).to.be.equal('2000000000');
    expect(poolAccountInfo.moveTotalSupply.toString()).to.be.equal('110000000000');
  });

  // Owner: 99,890 MOVE
  // Alice: 10 SOL - 10,000 MOVE
  // Bob: 10 SOL - 10,000 MOVE
  // Pool: 2 SOL - 110 MOVE

  it('Cannot add zero liquidity', async () => {
    try {
      await program.methods.addLiquidity(
        new BN(0), // 0 SOL
        new BN(0), // 0 MOVE
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
      new BN(0), // 0 SOL
      new BN(10_000_000_000), // 10 MOVE
    ).accounts({
      signer: alice.publicKey,
      signerTokenAccount: aliceMoveTokenAccount,
      poolAccount,
      poolMoveTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([alice]).rpc();
    let tokenAmount1 = await connection.getTokenAccountBalance(poolMoveTokenAccount);
    expect(tokenAmount1.value.amount).to.be.equal('120000000000'); // 120 MOVE;
    const poolAccountInfo1 = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo1.solTotalSupply.toString()).to.be.equal('2000000000');
    expect(poolAccountInfo1.moveTotalSupply.toString()).to.be.equal('120000000000');

    await program.methods.addLiquidity(
      new BN(1_000_000_000), // 1 SOL
      new BN(0), // 0 MOVE
    ).accounts({
      signer: bob.publicKey,
      signerTokenAccount: bobMoveTokenAccount,
      poolAccount,
      poolMoveTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([bob]).rpc();
    let tokenAmount2 = await connection.getTokenAccountBalance(poolMoveTokenAccount);
    expect(tokenAmount2.value.amount).to.be.equal('120000000000'); // 120 MOVE;
    const poolAccountInfo2 = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo2.solTotalSupply.toString()).to.be.equal('3000000000');
    expect(poolAccountInfo2.moveTotalSupply.toString()).to.be.equal('120000000000');
  });

  // Owner: 99,890 MOVE
  // Alice: 10 SOL - 9,990 MOVE
  // Bob: 9 SOL - 10,000 MOVE
  // Pool: 3 SOL - 120 MOVE

  it('Cannot add liquidity when program paused', async () => {
    await program.methods.setPaused(
      true
    ).accounts({
      signer: payerAccount,
      poolAccount,
    }).rpc();

    try {
      await program.methods.addLiquidity(
        new BN(1_000_000_000), // 1 SOL
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
      expect((err as AnchorError).error.errorCode.number).to.equal(6006);
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

  it('Swap SOL for MOVE', async () => {
    let tokenBeforeAmount = await connection.getTokenAccountBalance(bobMoveTokenAccount);
    expect(tokenBeforeAmount.value.amount).to.be.equal('10000000000000'); // 10,000 MOVE;
    // let balanceSolBefore = await connection.getBalance(poolAccount);
    // console.log(`${balanceSolBefore / LAMPORTS_PER_SOL} SOL`);
    // let balanceUserSolBefore = await connection.getBalance(poolOwner);
    // console.log(`${balanceUserSolBefore / LAMPORTS_PER_SOL} SOL`);
    await program.methods.swapSolForMove(
      new BN(1_000_000_000), // 1 SOL
    ).accounts({
      signer: bob.publicKey,
      signerTokenAccount: bobMoveTokenAccount,
      poolAccount,
      poolMoveTokenAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([bob]).rpc();
    // let balanceSolAfter = await connection.getBalance(poolAccount);
    // console.log(`${balanceSolAfter / LAMPORTS_PER_SOL} SOL`);
    // let balanceUserSolAfter = await connection.getBalance(poolOwner);
    // console.log(`${balanceUserSolAfter / LAMPORTS_PER_SOL} SOL`);
    let tokenAfterAmount = await connection.getTokenAccountBalance(bobMoveTokenAccount);
    expect(tokenAfterAmount.value.amount).to.be.equal('10010000000000'); // 10,010 MOVE;
    let tokenAmount = await connection.getTokenAccountBalance(poolMoveTokenAccount);
    expect(tokenAmount.value.amount).to.be.equal('110000000000'); // 110 MOVE;
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.solTotalSupply.toString()).to.be.equal('4000000000');
    expect(poolAccountInfo.moveTotalSupply.toString()).to.be.equal('110000000000');
  });

  // Owner: 99,890 MOVE
  // Alice: 10 SOL - 9,990 MOVE
  // Bob: 8 SOL - 10,010 MOVE
  // Pool: 4 SOL - 110 MOVE

  it('Swap MOVE for SOL', async () => {
    let tokenBeforeAmount = await connection.getTokenAccountBalance(aliceMoveTokenAccount);
    expect(tokenBeforeAmount.value.amount).to.be.equal('9990000000000'); // 9,990 MOVE;
    let balanceSolBefore = await connection.getBalance(alice.publicKey);
    console.log(`balanceSolBefore: ${balanceSolBefore / LAMPORTS_PER_SOL} SOL`);
    // let balanceUserSolBefore = await connection.getBalance(poolOwner);
    // console.log(`${balanceUserSolBefore / LAMPORTS_PER_SOL} SOL`);
    await program.methods.swapMoveForSol(
      new BN(1_000_000_000), // 1 MOVE
    ).accounts({
      signer: alice.publicKey,
      signerTokenAccount: aliceMoveTokenAccount,
      poolAccount,
      poolMoveTokenAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([alice]).rpc();
    let balanceSolAfter = await connection.getBalance(alice.publicKey);
    console.log(`balanceSolAfter: ${balanceSolAfter / LAMPORTS_PER_SOL} SOL`);
    // let balanceUserSolAfter = await connection.getBalance(poolOwner);
    // console.log(`${balanceUserSolAfter / LAMPORTS_PER_SOL} SOL`);
    let tokenAfterAmount = await connection.getTokenAccountBalance(aliceMoveTokenAccount);
    expect(tokenAfterAmount.value.amount).to.be.equal('9989000000000'); // 900 MOVE;
    let tokenAmount = await connection.getTokenAccountBalance(poolMoveTokenAccount);
    expect(tokenAmount.value.amount).to.be.equal('111000000000'); // 110 MOVE;
    const poolAccountInfo = await programInstance.account["pool"].fetch(poolAccount);
    expect(poolAccountInfo.solTotalSupply.toString()).to.be.equal('3900000000');
    expect(poolAccountInfo.moveTotalSupply.toString()).to.be.equal('111000000000');
  });

  // Owner: 99,890 MOVE
  // Alice: 10.1 SOL - 9,989 MOVE
  // Bob: 8 SOL - 10,010 MOVE
  // Pool: 3.9 SOL - 111 MOVE

  it('Cannot swap zero', async () => {
    try {
      await program.methods.swapSolForMove(
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
      expect((err as AnchorError).error.errorCode.number).to.equal(6002);
      expect(err.error.errorCode.code).to.equal("CannotSwapZero");
      expect(err.program.equals(program.programId)).is.true;
    }

    try {
      await program.methods.swapMoveForSol(
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
      expect((err as AnchorError).error.errorCode.number).to.equal(6002);
      expect(err.error.errorCode.code).to.equal("CannotSwapZero");
      expect(err.program.equals(program.programId)).is.true;
    }
  });

  it('Cannot swap when program paused', async () => {
    await program.methods.setPaused(
      true
    ).accounts({
      signer: payerAccount,
      poolAccount,
    }).rpc();

    try {
      await program.methods.swapSolForMove(
        new BN(1_000_000_000), // 1 SOL
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
      expect((err as AnchorError).error.errorCode.number).to.equal(6006);
      expect(err.error.errorCode.code).to.equal("Paused");
      expect(err.program.equals(program.programId)).is.true;
    }

    try {
      await program.methods.swapMoveForSol(
        new BN(1_000_000_000), // 1 MOVE
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
      expect((err as AnchorError).error.errorCode.number).to.equal(6006);
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
