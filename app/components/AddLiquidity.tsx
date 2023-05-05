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
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import {
  moveToken,
  poolProgramId,
  poolAccount,
  poolMoveTokenAccount,
} from "../utils/constants"
import * as token from "@solana/spl-token"
import { IDL } from '../utils/idl/swap_tokens'

export const AddLiquidityType: FC = () => {

  const [solAmount, setSolAmount] = useState(0)
  const [moveAmount, setMoveAmount] = useState(0)

  const { connection } = useConnection()
  const { publicKey, wallet, signTransaction, signAllTransactions } = useWallet();

  const sleep = async (ms: number) => {
    return new Promise((r) => setTimeout(r, ms));
  };

  const handleSubmit = (event: any) => {
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
    }

    // these are the accounts that hold the tokens
    const moveATA = await token.getAssociatedTokenAddress(moveToken, publicKey)
    const moveATAInfo = await connection.getAccountInfo(moveATA)

    if (!moveATAInfo) {
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

    const instruction = await program.methods.addLiquidity(
      new BN(solAmount * LAMPORTS_PER_SOL),
      new BN(moveAmount * 1e9)
    ).accounts({
      signer: publicKey,
      signerTokenAccount: moveATA,
      poolAccount,
      poolMoveTokenAccount,
      systemProgram: Web3.SystemProgram.programId,
      tokenProgram: token.TOKEN_PROGRAM_ID,
    }).instruction()

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
      <form onSubmit={handleSubmit}>
        <div style={{ padding: "0px 10px 5px 7px" }}>
          <FormControl>
            <FormLabel color="gray.200">
              Add MOVE to Liquidity Pool
            </FormLabel>
            <FormLabel color="gray.200">
              SOL Amount
            </FormLabel>
            <NumberInput
              onChange={(valueString) =>
                setSolAmount(parseFloat(valueString))
              }
              style={{
                fontSize: 20,
              }}
              placeholder="0.00"
            >
              <NumberInputField id="amount" color="gray.400" />
            </NumberInput>
            <FormLabel color="gray.200">
              MOVE Amount
            </FormLabel>
            <NumberInput
              onChange={(valueString) =>
                setMoveAmount(parseFloat(valueString))
              }
              style={{
                fontSize: 20,
              }}
              placeholder="0.00"
            >
              <NumberInputField id="amount" color="gray.400" />
            </NumberInput>
            <Button width="full" mt={4} type="submit">
              Add Liquidity
            </Button>
            <ToastContainer />
          </FormControl>
        </div>
      </form>
    </Box>
  )
}
