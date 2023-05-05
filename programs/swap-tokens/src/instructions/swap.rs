use crate::*;

#[derive(Accounts)]
pub struct Swap<'info> {
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
  /// CHECK: wallet which receive fund
  #[account(
    mut,
    address = pool_account.owner
  )]
  pub funding_wallet: AccountInfo<'info>,
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
}

pub fn exec(
  ctx: Context<Swap>,
  lamports: u64,
) -> Result<()> {
  let pool = &mut ctx.accounts.pool_account;

  invariant!(lamports > 0, SwapTokenErrorCode::CannotSwapZero);

  let move_amount = pool.swap_rate * lamports;

  invariant!(pool.total_supply >= move_amount, SwapTokenErrorCode::InsufficientMoveBalance);

  pool.total_supply -= move_amount;

  // Deposit SOL into pool
  invoke(
    &system_instruction::transfer(
      &ctx.accounts.signer.key(),
      &pool.owner,
      lamports,
    ),
    &[
      ctx.accounts.signer.to_account_info(),
      ctx.accounts.funding_wallet.to_account_info(),
      ctx.accounts.system_program.to_account_info(),
    ],
  )?;

  // Return MOVE to user
  let seeds = &[
    POOL_SEED,
    pool.owner.as_ref(),
    &[pool.bump],
  ];
  let signer = &[&seeds[..]];
  token::transfer(
    CpiContext::new_with_signer(
      ctx.accounts.token_program.to_account_info(),
      Transfer {
        from: ctx.accounts.pool_move_token_account.to_account_info(),
        to: ctx.accounts.signer_token_account.to_account_info(),
        authority: pool.to_account_info(),
      },
      signer,
    ),
    move_amount,
  )?;

  swap_emit!(SwapEvent { lamports, move_amount });

  Ok(())
}

#[event]
pub struct SwapEvent {
  lamports: u64,
  move_amount: u64,
}