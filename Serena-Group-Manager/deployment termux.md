# Serena Group Manager — Install, Update and Deploy

This guide covers Android Termux first, plus Linux, macOS and Windows PowerShell. The bot runs on Telegram Serverless after deployment; your phone or computer does not need to remain online.

For the full platform explanation, supported CLI workflow, runtime rules, database and Mini App features, see:
- [Telegram Serverless guide](../docs/TELEGRAM_SERVERLESS_GUIDE.md)
- [Cross-platform terminal guide](../docs/TERMINAL_DEPLOYMENT.md)
- [Serena Group Manager README](README.md)

## 1. Requirements

- A Telegram bot created with @BotFather.
- Serverless enabled for that bot.
- Its **CLI Access token** from BotFather → your bot → Serverless → CLI Access.
- Node.js 18+ with npm.
- Git.

The CLI Access token is not the regular Bot API token. Never paste either secret into GitHub or a public chat.

## 2. Android Termux — install the tools

```bash
pkg update
pkg upgrade
pkg install git nodejs
git --version
node --version
npm --version
```

Node.js must be version 18 or newer. If a Termux mirror returns 404, run `termux-change-repo`, choose a working official mirror, and retry `pkg update`.

## 3. Clone or open the repository

### Clean installation

The following commands use the nested folder layout already used in the Termux setup for this project:

```bash
mkdir -p "$HOME/Serverles-"
git clone https://github.com/botstelegram7-cmyk/Serverles-.git "$HOME/Serverles-/Serverles-"
cd "$HOME/Serverles-/Serverles-"
```

### Existing clone

Do not clone again if the repository is already on your phone. Open its actual folder and verify it:

```bash
cd "$HOME/Serverles-/Serverles-"
pwd
git status
git remote -v
git pull origin main
```

If your existing clone is in a different location, use that location instead. The output of `pwd` should be the folder containing the repository's root `README.md`, root `package.json`, and `Serena-Group-Manager/` directory.

## 4. Install Serena's dependencies

```bash
cd "$HOME/Serverles-/Serverles-/Serena-Group-Manager"
npm install
```

If your repository is in a different directory, replace the path with your actual location. Serena has its own `package.json` and its own local `.tgcloud/` state; the root Welcome Bot's login does not log in this project.

## 5. Link Serena to the correct Telegram bot

In @BotFather, enable Serverless for the bot you want to use for Serena Group Manager and obtain its **CLI Access token**. Then, from the Serena project folder, run:

```bash
npx tgcloud login
```

Follow the interactive prompt and paste the CLI Access token. Do not use the regular Bot API token. Login saves local CLI state in `.tgcloud/`; do not edit or commit that folder.

## 6. First deployment

Run these commands from `Serena-Group-Manager/`:

```bash
npx tgcloud status
npx tgcloud push
npx tgcloud migrate
npx tgcloud status
npx tgcloud webhook
```

Review migration prompts before confirming. The `push` command deploys code and reports pending database changes; `migrate` applies reviewed schema changes separately.

## 7. Group setup

1. Add Serena Group Manager to a test group or supergroup.
2. Promote it to administrator.
3. Grant only the permissions required for the features you intend to use:
   - **Delete messages** for `/purge`
   - **Ban/restrict users** for `/ban`, `/kick`, `/mute` and `/unmute`
   - **Pin messages** for `/pin` and `/unpin`
4. Send `/start` and `/help`.
5. Test the moderation commands in a group where you have authority.

## 8. Everyday update and redeploy

First pull code from the repository root, then enter Serena's project:

```bash
cd "$HOME/Serverles-/Serverles-"
git pull origin main
cd Serena-Group-Manager
npm install
npx tgcloud status
npx tgcloud diff
npx tgcloud push
npx tgcloud migrate
npx tgcloud status
npx tgcloud webhook
```

If you are already inside Serena's folder, run `cd ..` and then `git pull origin main` only if that puts you at the repository root. For this nested layout, from the Serena folder you can use:

```bash
cd "$HOME/Serverles-/Serverles-"
git pull origin main
cd Serena-Group-Manager
```

Then run the deploy commands above. Review the diff before pushing if you have local changes. Do not use `git reset --hard` or `git clean -fdx` as generic fixes; they can discard work or ignored local state.

## 9. Commands available in the bot

### General

- `/start` or `/menu` — main menu
- `/help` or `/commands` — command list
- `/version` — version
- `/status` — bot identity and relevant group permissions
- `/id` — chat/user ID
- `/admins` — group administrators
- `/rules` — saved rules

### Admin commands

Reply to a non-admin member's message when using member-targeted commands:

- `/ban`, `/unban`, `/kick`
- `/mute 10` — mute for 10 minutes; default is 60
- `/unmute` — restore group-default permissions
- `/warn reason`, `/warnings`, `/clearwarns`
- `/purge 10` — delete up to 10 messages before the command, maximum 100
- `/pin` — reply to a message to pin it
- `/unpin` — unpin the current pinned message
- `/setrules Be respectful and do not spam.`
- `/welcome on` or `/welcome off`

Telegram does not allow bots to moderate group owners or administrators. Actions fail if Telegram permissions are missing or the target/message is not eligible.

## 10. Token prompt or authentication problems

If `npx tgcloud login` reports that no token is found, confirm that you are in `Serena-Group-Manager/` and run `npx tgcloud login` again.

If the Termux paste menu is not working, try long-press → Paste in the token prompt. The documented CI environment-variable route can be used in a shell without echoing the token:

```bash
read -rsp "CLI Access token: " TGCLOUD_TOKEN
echo
export TGCLOUD_TOKEN
npx tgcloud status
npx tgcloud push
unset TGCLOUD_TOKEN
```

Use the environment-variable route only with a CLI version that supports `TGCLOUD_TOKEN`. Do not include the token in the command text, shell history, repository files or screenshots. Prefer interactive login for normal use.

## 11. Linux, macOS and Windows

The CLI commands are the same on all platforms. Install Git and Node.js 18+ first, clone the repository, then:

```bash
cd Serverles-/Serena-Group-Manager
npm install
npx tgcloud login
npx tgcloud status
npx tgcloud push
npx tgcloud migrate
```

For Windows PowerShell, use:

```powershell
Set-Location .\Serverles-\Serena-Group-Manager
npm install
npx tgcloud login
npx tgcloud status
npx tgcloud push
npx tgcloud migrate
```

See [the cross-platform guide](../docs/TERMINAL_DEPLOYMENT.md) for full install commands and update steps.

## 12. Troubleshooting

| Problem | What to check |
|---|---|
| `No CLI access token found` | Correct folder, then `npx tgcloud login`; use CLI Access token |
| Bot does not respond | Correct linked bot, `npx tgcloud status`, `npx tgcloud webhook`, handler path |
| Module import error | Relative imports inside `tgcloud/` must include `.js`; avoid arbitrary npm imports in runtime modules |
| Database schema changes pending | Review `npx tgcloud migrate --dry-run`, then confirm intended migrations |
| Push rejected because cloud is newer | Use `npx tgcloud fetch`, inspect differences, then sync carefully |
| Moderation permission error | Promote the bot and grant the required permission |
| Termux package 404 | Use `termux-change-repo` to select a working mirror |
| Button colours differ by device | Telegram clients may render styles differently |

## Security checklist

- Never commit CLI Access tokens, Bot API tokens or `.tgcloud/`.
- Do not paste credentials into chats, issues or screenshots.
- Keep the Welcome Bot and Serena Group Manager logins separate.
- Review code changes and migrations before deploying.
- Test moderation commands in a group where you are authorized to use them.