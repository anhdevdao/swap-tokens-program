use crate::*;

#[account]
pub struct Pool {
  pub owner: Pubkey,
  pub bump: u8,
  pub move_token: Pubkey,
  pub move_token_account_bump: u8,
  pub swap_rate: u64,
  pub sol_total_supply: u64,
  pub move_total_supply: u64,
  pub paused: bool,
}

impl Pool {
  pub const POOL_SIZE: usize = 8 + 32 + 1 + 32 + 1 + 8 + 8 + 8 + 1;

  pub fn when_not_paused(&self) -> Result<()> {
    invariant!(!self.paused, SwapTokenErrorCode::Paused);
    Ok(())
  }
}