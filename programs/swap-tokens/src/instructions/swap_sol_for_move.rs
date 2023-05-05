use crate::*;

#[derive(Accounts)]
pub struct SwapSOLForMOVE<'info> {
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
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
}

pub fn exec(
  ctx: Context<SwapSOLForMOVE>,
  lamports: u64,
) -> Result<()> {
  let pool = &mut ctx.accounts.pool_account;
  let pool_owner = pool.owner;
  let pool_bump = pool.bump;

  invariant!(lamports > 0, SwapTokenErrorCode::CannotSwapZero);

  let move_amount = pool.swap_rate * lamports;

  invariant!(pool.move_total_supply >= move_amount, SwapTokenErrorCode::InsufficientMOVEBalance);

  pool.sol_total_supply += lamports;
  pool.move_total_supply -= move_amount;

  // Deposit SOL into pool
  invoke(
    &system_instruction::transfer(
      &ctx.accounts.signer.key(),
      &pool.key(),
      lamports,
    ),
    &[
      ctx.accounts.signer.to_account_info(),
      ctx.accounts.pool_account.to_account_info(),
      ctx.accounts.system_program.to_account_info(),
    ],
  )?;

  // Return MOVE to user
  let seeds = &[
    POOL_SEED,
    pool_owner.as_ref(),
    &[pool_bump],
  ];
  let signer = &[&seeds[..]];
  token::transfer(
    CpiContext::new_with_signer(
      ctx.accounts.token_program.to_account_info(),
      Transfer {
        from: ctx.accounts.pool_move_token_account.to_account_info(),
        to: ctx.accounts.signer_token_account.to_account_info(),
        authority: ctx.accounts.pool_account.to_account_info(),
      },
      signer,
    ),
    move_amount,
  )?;

  swap_sol_for_move_emit!(SwapSOLForMOVEEvent { lamports, move_amount });

  Ok(())
}

#[event]
pub struct SwapSOLForMOVEEvent {
  lamports: u64,
  move_amount: u64,
}