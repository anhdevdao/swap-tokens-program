import {
  Box,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react"
import { FC, useEffect, useState } from "react"
import { AnchorProvider, BN, Program } from "@project-serum/anchor"
import * as Web3 from "@solana/web3.js"
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { ToastContainer, toast } from "react-toastify"
import {
  moveToken,
  poolProgramId,
  poolAccount,
  poolMoveTokenAccount,
} from "../utils/constants"
import * as token from "@solana/spl-token"
import { IDL } from '../utils/idl/swap_tokens'
import { useGetBalance } from "../hooks/useGetBalance"

export const SwapToken: FC = () => {
  const { getBalance } = useGetBalance()

  const [solAmount, setSolAmount] = useState(0)

  const { connection } = useConnection()
  const { publicKey, wallet, sendTransaction, signTransaction, signAllTransactions } = useWallet();

  useEffect(() => {

  })

  const handleSwapSubmit = (event: any) => {
    event.preventDefault()
    handleTransactionSubmit()
  }

  const handleTransactionSubmit = async () => {
    if (!wallet || !publicKey || !signTransaction || !signAllTransactions) {
      alert("Please connect your wallet!")
      return
    }

    const signerWallet = {
      publicKey,
      signTransaction,
      signAllTransactions,
    };
    // these are the accounts that hold the tokens
    const moveATA = await token.getAssociatedTokenAddress(moveToken, publicKey)

    let account = await connection.getAccountInfo(moveATA)

    if (account == null) {
      alert("Insufficient MOVE balance")
      return
    }

    const provider = new AnchorProvider(connection, signerWallet, {
      preflightCommitment: "processed",
      commitment: "processed"
    })

    const program = new Program(
      IDL,
      new Web3.PublicKey(poolProgramId),
      provider
    )

    const poolAccountInfo = await program.account["pool"].fetch(poolAccount);

    const instruction = await program.methods.swap(
      new BN(solAmount*LAMPORTS_PER_SOL)
    ).accounts({
      signer: publicKey,
      signerTokenAccount: moveATA,
      poolAccount,
      poolMoveTokenAccount,
      fundingWallet: poolAccountInfo.owner,
      systemProgram: Web3.SystemProgram.programId,
      tokenProgram: token.TOKEN_PROGRAM_ID,
    }).instruction();

    try {
      const signature = await sendTransaction(
        new Web3.Transaction().add(instruction),
        connection
      );

      connection.confirmTransaction(signature, "processed").then(() => {
        getBalance()
      })

      toast.success(`Transaction sent! Transaction Signature: ${signature}`)
    } catch (error) {
      toast.error(`Transaction failed: ${error}`)
    }
  }

  return (
    <Box
      p={4}
      display={{ md: "flex" }}
      maxWidth="32rem"
      margin={2}
      justifyContent="center"
    >
      <form onSubmit={handleSwapSubmit}>
        <FormControl>
          <FormLabel color="gray.200">
            Swap SOL to get MOVE
          </FormLabel>
          <NumberInput
            max={1000}
            min={0}
            onChange={(valueString) =>
              setSolAmount(parseFloat(valueString))
            }
          >
            <NumberInputField
              id="amount"
              color="gray.400" />
          </NumberInput>
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Swap ⇅
        </Button>
        <ToastContainer />
      </form>
    </Box>
  )
}
