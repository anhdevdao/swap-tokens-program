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
  #[msg("Insufficient MOVE balance")]
  InsufficientMoveBalance,
  #[msg("Paused")]
  Paused,
  #[msg("Only pool owner")]
  OnlyPoolOwner,
}