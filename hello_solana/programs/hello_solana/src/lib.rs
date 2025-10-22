use anchor_lang::{prelude::*};

declare_id!("9gnku41o8XCvjVnPYv4KZwT78oL8W8sq9wQLUvnVEqGZ");

#[program]
pub mod hello_solana {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>,username:String) -> Result<()> {
        msg!("Greetings from: {:?}", username);
        let ctx = &mut ctx.accounts.user_account;
        ctx.username = username;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(username:String)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init, 
        payer = signer, 
        space = 8 + UserAccount::INIT_SPACE + username.len(),
    )]
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    #[max_len(50)]
    pub username: String,
}
