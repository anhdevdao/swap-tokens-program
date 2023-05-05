import { Box } from "@chakra-ui/react"
import { PoolInfo } from "../components/PoolInfo"
import { WalletInfo } from "../components/WalletInfo"
import { AddLiquidityType } from "./AddLiquidity"
import { SwapToken } from "./Swap"
import { useGetBalance } from "../hooks/useGetBalance"

export const AppContent = () => {
  const { poolSolBalance, poolMoveBalance } = useGetBalance();

  return (
    <Box>
      <PoolInfo poolSolBalance={poolSolBalance} poolMoveBalance={poolMoveBalance} />
      <WalletInfo />
      <AddLiquidityType />
      <SwapToken />
    </Box>
  )
}
