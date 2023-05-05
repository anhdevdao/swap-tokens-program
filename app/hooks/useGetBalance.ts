import { useEffect, useState } from "react"
import { useConnection } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  poolAccount,
  poolMoveTokenAccount,
} from "../utils/constants"

export const useGetBalance: () => {
  poolSolBalance: string,
  poolMoveBalance: string,
  getBalance: () => Promise<void>,
} = () => {
  const [poolSolBalance, setPoolSolBalance] = useState<string>("")
  const [poolMoveBalance, setPoolMoveBalance] = useState<string>("")

  const { connection } = useConnection()

  const getBalance = async () => {
    const _poolSolBalance = await connection.getBalance(poolAccount)
    _poolSolBalance && setPoolSolBalance(String(_poolSolBalance / LAMPORTS_PER_SOL))

    let _poolMoveBalance = await connection.getTokenAccountBalance(poolMoveTokenAccount)

    _poolMoveBalance.value.uiAmount && setPoolMoveBalance(String(_poolMoveBalance.value.uiAmount))
  }

  useEffect(() => {
    getBalance()
  }, [])

  return { poolSolBalance, poolMoveBalance, getBalance }
}