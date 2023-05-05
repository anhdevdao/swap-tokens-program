use crate::*;

#[error_code]
pub enum SwapTokenErrorCode {
  #[msg("Already paused/unpaused")]
  AlreadyPausedOrUnpaused,
  #[msg("Cannot add liquidity 0")]
  CannotAddLiquidityZero,
  #[msg("Cannot swap 0")]
  CannotSwapZero,
  #[msg("Invalid swap rate")]
  InvalidSwapRate,
  #[msg("Insufficient SOL balance")]
  InsufficientSOLBalance,
  #[msg("Insufficient MOVE balance")]
  InsufficientMOVEBalance,
  #[msg("Paused")]
  Paused,
  #[msg("Only pool owner")]
  OnlyPoolOwner,
}