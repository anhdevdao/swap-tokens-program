use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use vipers::invariant;

declare_id!("7cB8uQty7ZjK2Mq4ZDsBQNWUpUaLEHwfZKHLvS55k7rz");

pub mod instructions;
pub use instructions::*;

pub mod schema;
pub use schema::*;

pub mod macros;
pub use macros::*;

pub mod errors;
pub use errors::*;

#[program]
pub mod swap_tokens {
  use super::*;

  pub fn initialize(
    ctx: Context<Initialize>,
    swap_rate: u64,
    amount: u64,
  ) -> Result<()> {
    let pool_bump = *ctx.bumps.get("pool_account").unwrap();
    let pool_move_bump = *ctx.bumps.get("pool_move_token_account").unwrap();

    initialize::exec(
      ctx,
      pool_bump,
      pool_move_bump,
      swap_rate,
      amount,
    )
  }

  #[access_control(ctx.accounts.pool_account.when_not_paused())]
  pub fn add_liquidity(
    ctx: Context<AddLiquidity>,
    amount: u64,
  ) -> Result<()> {
    add_liquidity::exec(ctx, amount)
  }

  #[access_control(ctx.accounts.pool_account.when_not_paused())]
  pub fn swap(
    ctx: Context<Swap>,
    lamports: u64,
  ) -> Result<()> {
    swap::exec(ctx, lamports)
  }

  pub fn set_swap_rate(
    ctx: Context<SetSwapRate>,
    rate: u64,
  ) -> Result<()> {
    set_swap_rate::exec(ctx, rate)
  }

  pub fn set_paused(
    ctx: Context<SetPaused>,
    paused: bool,
  ) -> Result<()> {
    set_paused::exec(ctx, paused)
  }
}