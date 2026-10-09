# Terminal Deployment Guide

This guide covers Termux on Android, Linux, macOS and Windows PowerShell. The same `tgcloud` commands are used across platforms; only installation and directory syntax differ.

Official platform guide: [Telegram Serverless](https://blogfork.telegram.org/bots/serverless). Platform concepts and CLI lifecycle: [TELEGRAM_SERVERLESS_GUIDE.md](TELEGRAM_SERVERLESS_GUIDE.md).

## Before you start

1. Create a Telegram bot with @BotFather.
2. Enable Serverless for that bot.
3. Find the **CLI Access token** under BotFather → your bot → Serverless → CLI Access.
4. Install Git and Node.js 18+ with npm.
5. Choose which project you are deploying:
   - repository root = Welcome Bot
   - `Serena-Group-Manager/` = group moderation bot

**Each project folder has its own CLI state and should be logged into its own bot.** Do not assume the parent project's login also logs in Serena Group Manager.

## A. Android Termux

### Install tools

Use a current Termux installation from a trusted source. Then:

```bash
pkg update
pkg upgrade
pkg install git nodejs
git --version
node --version
npm --version
```

If package mirrors fail, use `termux-change-repo`, select a working official mirror, then retry `pkg update`.

### Clone the repository

For a clean installation, use this path:

```bash
mkdir -p "$HOME/Serverles-"
git clone https://github.com/botstelegram7-cmyk/Serverles-.git "$HOME/Serverles-/Serverles-"
cd "$HOME/Serverles-/Serverles-"
```

If you already cloned the repository, **do not clone it again**. Go to the existing repository folder and confirm it with:

```bash
pwd
git status
git remote -v
```

This guide uses `$HOME/Serverles-/Serverles-` to match the existing Termux layout discussed for this repository. If your `pwd` shows a different path, substitute your actual path in the commands below.

### Deploy the Welcome Bot (root project)

```bash
cd "$HOME/Serverles-/Serverles-"
git pull origin main
npm install
npx tgcloud login
npx tgcloud status
npx tgcloud push
npx tgcloud migrate
npx tgcloud webhook
```

### Deploy Serena Group Manager

```bash
cd "$HOME/Serverles-/Serverles-"
git pull origin main
cd Serena-Group-Manager
npm install
npx tgcloud login
npx tgcloud status
npx tgcloud push
npx tgcloud migrate
npx tgcloud webhook
```

When `npx tgcloud login` prompts, paste the **CLI Access token** for the specific bot you are linking. It is not the regular Bot API token.

### Everyday Serena update/redeploy

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
```

If you are already inside `Serena-Group-Manager`, return to the repository root before `git pull`, then enter the subproject again.

### If token paste is difficult in Termux

First try the Termux long-press menu and **Paste** in the interactive `npx tgcloud login` prompt.

If your CLI version supports the documented environment variable, enter the token without echoing it:

```bash
read -rsp "CLI Access token: " TGCLOUD_TOKEN
echo
export TGCLOUD_TOKEN
npx tgcloud status
npx tgcloud push
unset TGCLOUD_TOKEN
```

Do not type the token directly after the command, store it in a committed file, or share it in a screenshot. If this environment-variable method fails, use interactive `npx tgcloud login` and share only the error text with secrets removed.

## B. Linux (Debian/Ubuntu)

Install Git and Node.js 18+ using your preferred trusted package source or Node.js installation method. For a system where `nodejs` and `npm` are provided by the configured repositories:

```bash
sudo apt update
sudo apt install git nodejs npm
node --version
npm --version
```

Check the Node version: it must be 18 or newer. If the repository version is older, install a current supported Node.js version using the official Node.js instructions.

Clone and deploy Serena:

```bash
git clone https://github.com/botstelegram7-cmyk/Serverles-.git
cd Serverles-/Serena-Group-Manager
npm install
npx tgcloud login
npx tgcloud status
npx tgcloud push
npx tgcloud migrate
```

## C. macOS

Install Git and Node.js 18+ (for example, using the official Node.js installer or a trusted package manager). Verify:

```bash
git --version
node --version
npm --version
```

Then clone and deploy:

```bash
git clone https://github.com/botstelegram7-cmyk/Serverles-.git
cd Serverles-/Serena-Group-Manager
npm install
npx tgcloud login
npx tgcloud status
npx tgcloud push
npx tgcloud migrate
```

## D. Windows PowerShell

Install Git for Windows and Node.js 18+ (including npm). Open a new PowerShell window and verify:

```powershell
git --version
node --version
npm --version
```

Clone and deploy Serena Group Manager:

```powershell
git clone https://github.com/botstelegram7-cmyk/Serverles-.git
Set-Location .\Serverles-\Serena-Group-Manager
npm install
npx tgcloud login
npx tgcloud status
npx tgcloud push
npx tgcloud migrate
```

Update later:

```powershell
Set-Location ..
git pull origin main
Set-Location .\Serena-Group-Manager
npm install
npx tgcloud status
npx tgcloud diff
npx tgcloud push
npx tgcloud migrate
```

## E. Standard update and redeploy sequence

Use this order after pulling code changes:

```bash
git pull origin main
npm install
npx tgcloud status
npx tgcloud diff
npx tgcloud push
npx tgcloud migrate
npx tgcloud status
npx tgcloud webhook
```

Run it **inside the selected project's folder**. For the root Welcome Bot, run from the repository root. For Serena Group Manager, enter `Serena-Group-Manager/` first.

Why the order matters:
- `git pull` gets the latest source.
- `npm install` synchronizes local CLI dependencies.
- `status` and `diff` help review the local/cloud difference.
- `push` deploys code.
- `migrate` separately applies database schema changes.
- `webhook` inspects the platform-managed webhook.

Do not use `git reset --hard`, `git clean -fdx`, or `push --force` as generic troubleshooting commands.

## F. Common problems

| Error/symptom | Next step |
|---|---|
| `No CLI access token found` | Confirm the project directory and run `npx tgcloud login` with the CLI Access token |
| Bot does not answer | Check the selected bot, `npx tgcloud status`, `npx tgcloud webhook`, and handler path |
| CLI module not found | Run `npm install` inside that project |
| Database changes still pending | Review `npx tgcloud migrate --dry-run`, then apply intended changes |
| Push rejected because cloud changed | Use `npx tgcloud fetch`, review changes and pull/sync before retrying |
| Permission denied for group command | Promote Serena to administrator and grant the specific Telegram permission |
| Termux mirror 404 | Run `termux-change-repo`, choose a working mirror, then `pkg update` |
| Button colours vary by device | Telegram client rendering varies; use supported style values and test on your client |

## G. After deployment

- Open the correct bot in Telegram and send `/start`.
- For Serena, add it to a test group and promote it with only the permissions it needs.
- Test commands in a private test group before using them in a live group.
- Confirm `npx tgcloud status` shows the deployed state as synchronized.
- Termux, a laptop or a VPS does not need to stay running for the already-deployed bot to execute on Telegram Serverless.

## Security checklist

- [ ] CLI Access token never committed to Git.
- [ ] Regular Bot API token never committed to Git.
- [ ] `.tgcloud/` remains local and ignored.
- [ ] The intended project folder is selected before every CLI command.
- [ ] Migration changes reviewed before confirmation.
- [ ] Serena Group Manager tested in a group where you have moderation authority.