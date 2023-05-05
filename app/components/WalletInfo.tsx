import { useEffect, useState } from "react"
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { getAssociatedTokenAddress } from "@solana/spl-token"
import * as Web3 from "@solana/web3.js"
import { AnchorProvider, Program } from "@project-serum/anchor"
import {
  moveToken,
  poolProgramId,
  poolAccount,
} from "../utils/constants"
import { IDL } from '../utils/idl/swap_tokens'

export const WalletInfo = () => {
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const { connection } = useConnection()

  const [userSolBalance, setUserSolBalance] = useState<string>("")
  const [userMoveBalance, setUserMoveBalance] = useState<string>("")
  const [swapRate, setSwapRate] = useState<string>("")

  useEffect(() => {
    if (!connection || !publicKey || !signTransaction || !signAllTransactions) { return }

    connection.getBalance(publicKey).then((result) => {
      result && setUserSolBalance(String(result / LAMPORTS_PER_SOL))
    })

    getAssociatedTokenAddress(
      moveToken,
      publicKey
    ).then((account) => {
      return connection.getTokenAccountBalance(account)
    }).then((_userMoveBalance) => {
      _userMoveBalance.value.uiAmount && setUserMoveBalance(String(_userMoveBalance.value.uiAmount))
    })

    const signerWallet = {
      publicKey,
      signTransaction,
      signAllTransactions,
    };

    const provider = new AnchorProvider(connection, signerWallet, {
      preflightCommitment: "processed",
      commitment: "processed"
    })

    const program = new Program(
      IDL,
      new Web3.PublicKey(poolProgramId),
      provider
    )

    program.account["pool"].fetch(poolAccount).then((accountInfo) => {
      accountInfo && setSwapRate(accountInfo.swapRate.toString())
    });
  })

  return (
    <div>
      {publicKey ? (
        <>
          <p style={{ color: 'white' }}>
            <strong>Pool Swap Rate:</strong> 1 SOL = {swapRate} MOVE
          </p>
          <p style={{ color: 'white' }}>
            <strong>SOL Balance:</strong> {userSolBalance} SOL
          </p>
          <p style={{ color: 'white' }}>
            <strong>MOVE Balance:</strong> {userMoveBalance} MOVE
          </p>
        </>
      ) : (
        <p style={{ color: 'white' }}>
          Connect your wallet to see your balance
        </p>
      )}
    </div>
  );
}