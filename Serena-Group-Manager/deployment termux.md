# Serena Group Manager — Termux Deployment Guide

This guide is for Android Termux. The bot runs on Telegram Serverless after deployment; Termux is only needed to install dependencies, change code, and push updates.

## 1. One-time Termux setup

Update packages:

```bash
pkg update
pkg upgrade
pkg install git nodejs
```

Check the tools:

```bash
git --version
node -v
npm -v
```

If package downloads return a 404, run `termux-change-repo`, select **Single mirror**, then choose `packages.termux.dev` if available. Run `pkg update` again.

## 2. Download the repository

If you have not cloned the parent repository yet:

```bash
cd ~
git clone https://github.com/botstelegram7-cmyk/Serverles-.git
cd ~/Serverles-/Serena-Group-Manager
```

If `~/Serverles-` already exists, do not clone it again. Use:

```bash
cd ~/Serverles-
git pull origin main
cd Serena-Group-Manager
```

## 3. Install the project dependencies

Run from inside `Serena-Group-Manager`:

```bash
npm install
```

## 4. Link the bot (first deployment only)

Create a bot using @BotFather, enable Serverless for it, and get the **CLI Access token** from:

`@BotFather → your bot → Serverless → CLI Access → Access token`

Then run:

```bash
npx tgcloud login
```

Paste the **CLI Access token** into the hidden prompt. Do not use the regular Telegram Bot API token, and never share either token in chats or GitHub.

If you already linked this exact project folder successfully, you usually do not need to log in again. The local `.tgcloud/` folder stores CLI state and is intentionally ignored by Git.

### If the hidden token prompt will not accept input

Try the Termux long-press menu and choose **Paste**. If normal typing works but the prompt still does not, cancel with Ctrl+C and use the CLI's environment-variable option.

Enter the token without displaying it:

```bash
read -rsp "CLI Access token: " TGCLOUD_TOKEN
echo
export TGCLOUD_TOKEN
npx tgcloud push
unset TGCLOUD_TOKEN
```

The token is secret. Do not put it in a command you plan to share, a GitHub file, or a screenshot. If the prompt accepts the token and says it linked to an app, continue below.

## 5. First deployment

Make sure your current directory is `~/Serverles-/Serena-Group-Manager`:

```bash
pwd
```

Then push the modules:

```bash
npx tgcloud push
```

Apply the database schema:

```bash
npx tgcloud migrate
```

If migration asks you to confirm the new tables, review the prompt and type `y` to apply them. Then check status:

```bash
npx tgcloud status
```

## 6. Update the code and redeploy later

Whenever the code in GitHub changes, run:

```bash
cd ~/Serverles-
git pull origin main
cd Serena-Group-Manager
npm install
npx tgcloud push
npx tgcloud migrate
npx tgcloud status
```

Run the commands in order. If no database schema changed, `migrate` should be safe to run and will report whether anything needs applying.

## 7. Group setup in Telegram

1. Add **Serena Group Manager** to your group or supergroup.
2. Promote it to administrator.
3. Enable only the permissions it needs:
   - Delete messages (for `/purge`)
   - Ban users (for `/ban`, `/kick`, `/mute`, and `/unmute`)
   - Pin messages (for `/pin` and `/unpin`)
4. Use `/start` or `/help` to view the menu.
5. Reply to a member's message before using `/ban`, `/kick`, `/mute`, `/unmute`, `/warn`, `/warnings`, or `/clearwarns`.
6. Use `/setrules Your group rules here` to set the rules and `/welcome on` or `/welcome off` to toggle welcome messages.

Telegram does not let bots moderate group administrators, and the bot cannot perform an action without the corresponding Telegram admin permission.

## 8. Useful commands

```text
/start          Open the menu
/help           Show all commands
/version        Show bot version
/status         Check bot permissions and settings
/id             Show chat and user IDs
/admins         List group administrators
/rules          View group rules
/setrules TEXT  Set group rules (admin only)
/welcome on     Enable welcome messages (admin only)
/welcome off    Disable welcome messages (admin only)
/ban            Reply to a member's message to ban them
/unban          Reply to a user's message to remove their ban
/kick           Reply to a member's message to remove them
/mute 10        Reply to a member's message to mute for 10 minutes
/unmute         Reply to a member's message to restore permissions
/warn REASON    Reply to a member's message to record a warning
/warnings       Reply to a member's message to view warning history
/clearwarns     Reply to a member's message to clear warnings
/purge 10       Delete up to 10 messages immediately before the command
/pin            Reply to the message to pin
/unpin          Unpin the current pinned message
```

## 9. Troubleshooting

- **No CLI access token found:** Run `npx tgcloud login` from this project folder. Make sure the correct CLI Access token is used.
- **Bot does not respond:** Check `npx tgcloud status`, confirm the correct bot is linked, and check that deployment completed without errors.
- **Moderation command fails:** Promote the bot to administrator and grant the relevant permission. Reply to the target user's message.
- **Migration errors:** Run `npx tgcloud status` and inspect the migration output before retrying. Do not delete the local `.tgcloud/` directory as a first troubleshooting step.
- **Termux closes:** Once deployed, the bot runs on Telegram Serverless; Termux does not need to stay open.
- **Button colours look different:** Telegram controls button styling in the client. The project requests supported `primary`, `success`, and `danger` styles, but older clients may ignore them.

## Security notes

Never commit Bot API tokens or CLI Access tokens. The repository contains code and setup instructions only; authentication should remain in the local ignored `.tgcloud/` state or a temporary environment variable.