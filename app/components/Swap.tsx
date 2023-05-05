import {
  Box,
  Select,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react"
import { FC, useState } from "react"
import { AnchorProvider, BN, Program } from "@project-serum/anchor"
import * as Web3 from "@solana/web3.js"
import { LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js';
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
  const [mint, setMint] = useState("sol")
  const [swapAmount, setSwapAmount] = useState(0)

  const { connection } = useConnection()
  const { publicKey, wallet, sendTransaction, signTransaction, signAllTransactions } = useWallet();

  const sleep = async (ms: number) => {
    return new Promise((r) => setTimeout(r, ms));
  };

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

    let instruction: TransactionInstruction;
    if (mint === "sol") {
      instruction = await program.methods.swapSolForMove(
        new BN(swapAmount * LAMPORTS_PER_SOL)
      ).accounts({
        signer: publicKey,
        signerTokenAccount: moveATA,
        poolAccount,
        poolMoveTokenAccount,
        systemProgram: Web3.SystemProgram.programId,
        tokenProgram: token.TOKEN_PROGRAM_ID,
      }).instruction();
    } else {
      instruction = await program.methods.swapMoveForSol(
        new BN(swapAmount * LAMPORTS_PER_SOL)
      ).accounts({
        signer: publicKey,
        signerTokenAccount: moveATA,
        poolAccount,
        poolMoveTokenAccount,
        systemProgram: Web3.SystemProgram.programId,
        tokenProgram: token.TOKEN_PROGRAM_ID,
      }).instruction();
    }

    try {
      const transaction = new Web3.Transaction().add(instruction)
      let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      const signedTransaction = await signTransaction(transaction)
      const rawTransaction = signedTransaction.serialize();
      const blockhashResponse = await connection.getLatestBlockhashAndContext();
      const lastValidBlockHeight = blockhashResponse.context.slot + 5;
      let blockheight = await connection.getBlockHeight();

      let signature = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      });
      toast.success(`Transaction sent! Transaction Signature: ${signature}`)
      while (blockheight < lastValidBlockHeight) {
        signature = await connection.sendRawTransaction(rawTransaction, {
          skipPreflight: true,
        });
        await sleep(500);
        blockheight = await connection.getBlockHeight()
      }
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
            Swap
          </FormLabel>
          <NumberInput
            max={1000}
            min={0}
            onChange={(valueString) =>
              setSwapAmount(parseFloat(valueString))
            }
          >
            <NumberInputField
              id="amount"
              color="gray.400" />
          </NumberInput>
          <div style={{ display: "felx" }}>
            <Select
              display={{ md: "flex" }}
              justifyContent="center"
              placeholder="Token to Swap"
              color="white"
              variant="outline"
              dropShadow="#282c34"
              onChange={(item) =>
                setMint(item.currentTarget.value)
              }
            >
              <option
                style={{ color: "#282c34" }}
                value="sol"
              >
                {" "}
                SOL{" "}
              </option>
              <option
                style={{ color: "#282c34" }}
                value="move"
              >
                {" "}
                MOVE{" "}
              </option>
            </Select>
          </div>
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Swap ⇅
        </Button>
        <ToastContainer />
      </form>
    </Box>
  )
}
