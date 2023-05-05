export type SwapTokens = {
  "version": "0.1.0",
  "name": "swap_tokens",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolMoveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "moveToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "swapRate",
          "type": "u64"
        },
        {
          "name": "lamports",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "addLiquidity",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolMoveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lamports",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapSolForMove",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolMoveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapMoveForSol",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolMoveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setSwapRate",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "rate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setPaused",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "paused",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "moveToken",
            "type": "publicKey"
          },
          {
            "name": "moveTokenAccountBump",
            "type": "u8"
          },
          {
            "name": "swapRate",
            "type": "u64"
          },
          {
            "name": "solTotalSupply",
            "type": "u64"
          },
          {
            "name": "moveTotalSupply",
            "type": "u64"
          },
          {
            "name": "paused",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "AddLiquidityEvent",
      "fields": [
        {
          "name": "lamports",
          "type": "u64",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "SetPausedEvent",
      "fields": [
        {
          "name": "paused",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "SetSwapRateEvent",
      "fields": [
        {
          "name": "rate",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "SwapMOVEForSOLEvent",
      "fields": [
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "solAmount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "SwapSOLForMOVEEvent",
      "fields": [
        {
          "name": "lamports",
          "type": "u64",
          "index": false
        },
        {
          "name": "moveAmount",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AlreadyPausedOrUnpaused",
      "msg": "Already paused/unpaused"
    },
    {
      "code": 6001,
      "name": "CannotAddLiquidityZero",
      "msg": "Cannot add liquidity 0"
    },
    {
      "code": 6002,
      "name": "CannotSwapZero",
      "msg": "Cannot swap 0"
    },
    {
      "code": 6003,
      "name": "InvalidSwapRate",
      "msg": "Invalid swap rate"
    },
    {
      "code": 6004,
      "name": "InsufficientSOLBalance",
      "msg": "Insufficient SOL balance"
    },
    {
      "code": 6005,
      "name": "InsufficientMOVEBalance",
      "msg": "Insufficient MOVE balance"
    },
    {
      "code": 6006,
      "name": "Paused",
      "msg": "Paused"
    },
    {
      "code": 6007,
      "name": "OnlyPoolOwner",
      "msg": "Only pool owner"
    }
  ]
};

export const IDL: SwapTokens = {
  "version": "0.1.0",
  "name": "swap_tokens",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolMoveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "moveToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "swapRate",
          "type": "u64"
        },
        {
          "name": "lamports",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "addLiquidity",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolMoveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lamports",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapSolForMove",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolMoveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapMoveForSol",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolMoveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setSwapRate",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "rate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setPaused",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "paused",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "moveToken",
            "type": "publicKey"
          },
          {
            "name": "moveTokenAccountBump",
            "type": "u8"
          },
          {
            "name": "swapRate",
            "type": "u64"
          },
          {
            "name": "solTotalSupply",
            "type": "u64"
          },
          {
            "name": "moveTotalSupply",
            "type": "u64"
          },
          {
            "name": "paused",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "AddLiquidityEvent",
      "fields": [
        {
          "name": "lamports",
          "type": "u64",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "SetPausedEvent",
      "fields": [
        {
          "name": "paused",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "SetSwapRateEvent",
      "fields": [
        {
          "name": "rate",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "SwapMOVEForSOLEvent",
      "fields": [
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "solAmount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "SwapSOLForMOVEEvent",
      "fields": [
        {
          "name": "lamports",
          "type": "u64",
          "index": false
        },
        {
          "name": "moveAmount",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AlreadyPausedOrUnpaused",
      "msg": "Already paused/unpaused"
    },
    {
      "code": 6001,
      "name": "CannotAddLiquidityZero",
      "msg": "Cannot add liquidity 0"
    },
    {
      "code": 6002,
      "name": "CannotSwapZero",
      "msg": "Cannot swap 0"
    },
    {
      "code": 6003,
      "name": "InvalidSwapRate",
      "msg": "Invalid swap rate"
    },
    {
      "code": 6004,
      "name": "InsufficientSOLBalance",
      "msg": "Insufficient SOL balance"
    },
    {
      "code": 6005,
      "name": "InsufficientMOVEBalance",
      "msg": "Insufficient MOVE balance"
    },
    {
      "code": 6006,
      "name": "Paused",
      "msg": "Paused"
    },
    {
      "code": 6007,
      "name": "OnlyPoolOwner",
      "msg": "Only pool owner"
    }
  ]
};
