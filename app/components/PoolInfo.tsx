import { Text } from "@chakra-ui/react"
import React from "react";

type Props = {
  poolSolBalance: string,
  poolMoveBalance: string
}

export const PoolInfo = ({poolSolBalance, poolMoveBalance}: Props): React.ReactElement => {

  return (
    <Text style={{color: 'white'}}>
      <p>
        <strong>NOTE!!! Reload page if value of balance do not change after sending transaction</strong>
      </p>
      <span>
        <strong>Private Key with Prefund Tokens: </strong>
        <p>
          52ruwo5CT8C1eZXjHPHMKYPDSUMeuwUvq4zL45Fn2WZfkF4mnn6kWaFDA8Z75nYPwhTjRkEUshwsKh75V5nRqd55
        </p>
        <p>
          mHY2aCChJGbNSdtgfEuvriAQ8FkoxWeX4XwdZRgnrJYy9RzGfyjWvWK3wZzrKThHY3FN1EmRsqDHjygpxzoea8D
        </p>
        <strong>Pool SOL Balance: </strong> { poolSolBalance } SOL {" "}
        <strong>Pool MOVE Balance: </strong> { poolMoveBalance} MOVE
      </span>
    </Text>
  );
}