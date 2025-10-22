use anchor_lang::prelude::*;

declare_id!("6TSaJRScf2vjLAYhPf2in8D12ZhS9becCcbCjvKCQ7Yr");

#[program]

pub mod anchor_counter {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        msg!("Counter Account created!");
        msg!("Current Count: {}", counter.count);
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        msg!("Earlier Counter value: {}", counter.count);
        counter.count = counter.count.checked_add(1).unwrap();
        msg!("After Increment Counter value: {}", counter.count);
        Ok(())
    }
    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        msg!("Earlier Counter value: {}", counter.count);
        counter.count = counter.count.checked_sub(1).unwrap();
        msg!("After Decrement Counter value: {}", counter.count);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = DISCRIMINIATOR + Counter::INIT_SPACE,
    )]
    pub counter: Account<'info, Counter>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
    pub user: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub count: u8,
}

const DISCRIMINIATOR: usize = 8;
