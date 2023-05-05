import { Text } from "@chakra-ui/react"
import React from "react";

type Props = {
  poolSolBalance: string,
  poolMoveBalance: string
}

export const PoolInfo = ({poolSolBalance, poolMoveBalance}: Props): React.ReactElement => {

  return (
    <Text style={{color: 'white'}}>
      <span>
        <strong>Pool SOL Balance: </strong> { poolSolBalance } SOL {" "}
        <strong>Pool MOVE Balance: </strong> { poolMoveBalance} MOVE
      </span>
    </Text>
  );
}