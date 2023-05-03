use crate::*;

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
  #[account(mut)]
  pub signer: Signer<'info>,
  #[account(mut)]
  pub signer_token_account: Box<Account<'info, TokenAccount>>,
  #[account(
    mut,
    seeds = [POOL_SEED, pool_account.owner.as_ref()],
    bump = pool_account.bump,
  )]
  pub pool_account: Account<'info, Pool>,
  #[account(
    mut,
    seeds = [POOL_MOVE_SEED, pool_account.key().as_ref()],
    bump = pool_account.move_token_account_bump,
  )]
  pub pool_move_token_account: Box<Account<'info, TokenAccount>>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
}

pub fn exec(
  ctx: Context<AddLiquidity>,
  amount: u64,
) -> Result<()> {
  let pool = &mut ctx.accounts.pool_account;

  invariant!(amount > 0, SwapTokenErrorCode::CannotAddLiquidityZero);

  pool.total_supply += amount;

  token::transfer(
    CpiContext::new(
      ctx.accounts.token_program.to_account_info(),
      Transfer {
        from: ctx.accounts.signer_token_account.to_account_info(),
        to: ctx.accounts.pool_move_token_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
      },
    ),
    amount,
  )?;

  add_liquidity_emit!(AddLiquidityEvent { amount });

  Ok(())
}

#[event]
pub struct AddLiquidityEvent {
  amount: u64,
}