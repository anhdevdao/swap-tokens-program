import {
  Box,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react"
import { FC, useState } from "react"
import { AnchorProvider, BN, Program } from "@project-serum/anchor"
import * as Web3 from "@solana/web3.js"
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
import { useGetBalance } from "../hooks/useGetBalance"

export const AddLiquidityType: FC = () => {
  const { getBalance } = useGetBalance()

  const [moveAmount, setMoveAmount] = useState(0)

  const { connection } = useConnection()
  const { publicKey, wallet, sendTransaction, signTransaction, signAllTransactions } = useWallet();

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
      <form onSubmit={handleSubmit}>
        <div style={{ padding: "0px 10px 5px 7px" }}>
          <FormControl>
            <FormLabel color="gray.200">
              Add MOVE to Liquidity Pool
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
              Add MOVE
            </Button>
            <ToastContainer />
          </FormControl>
        </div>
      </form>
    </Box>
  )
}
