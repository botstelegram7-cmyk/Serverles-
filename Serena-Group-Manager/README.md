# Serena Group Manager

A Telegram group moderation bot built for Telegram Serverless using `@tgcloud/cli`. It is maintained as an independent project inside this repository.

## Features

- Button-based help menu with Telegram-supported inline button styles
- Group administrator listing and chat/user ID lookup
- Persistent group rules
- New-member welcome messages with an on/off setting
- Reply-based ban, unban, kick, mute and unmute commands
- Persistent warning history, warning lookup and clearing
- Purge up to 100 recent messages
- Pin and unpin messages
- Version and bot-permission status commands
- SQLite-backed settings and warning records
- Error messages when Telegram rejects an action or permissions are missing

> Telegram clients decide how inline button styles are rendered. The bot requests supported styles, but colours can differ on older clients.

## Requirements

- Node.js 18+ and npm
- Git
- A bot created with @BotFather
- Telegram Serverless enabled for that bot
- The bot's **CLI Access token** from BotFather → your bot → Serverless → CLI Access
- Administrator permissions in each group where moderation is required

The CLI Access token is not the regular Bot API token. Do not share or commit it.

## First deployment

From the root of this repository:

```bash
cd Serena-Group-Manager
npm install
npx tgcloud login
npx tgcloud status
npx tgcloud push
npx tgcloud migrate
npx tgcloud webhook
```

Review migration prompts before confirming. Each project has separate local `.tgcloud/` state; linking the Welcome Bot at the repository root does not link this subproject.

For Android Termux, Linux, macOS and Windows PowerShell, follow the detailed [deployment termux.md](deployment%20termux.md).

## Commands

### General commands

| Command | Description |
|---|---|
| `/start`, `/menu` | Open the main menu |
| `/help`, `/commands` | Show commands |
| `/version` | Show bot version |
| `/status` | Check bot identity, group role and relevant permissions |
| `/id` | Show chat and your user ID |
| `/admins` | List group administrators |
| `/rules` | Show saved group rules |

### Administrator commands

These commands are for group/supergroup administrators and require the bot to have the relevant Telegram permission. Reply to a non-admin member's message for member-targeted commands.

| Command | Usage |
|---|---|
| `/ban` | Reply to a member's message, then ban |
| `/unban` | Reply to a message from the user, then remove their ban |
| `/kick` | Reply to a member's message, then remove them |
| `/mute 10` | Reply to a member's message, then mute for 10 minutes; defaults to 60 |
| `/unmute` | Reply to a muted member's message, then restore the group's default permissions |
| `/warn reason` | Reply to a member's message to record a warning |
| `/warnings` | Reply to a member's message to view warning history |
| `/clearwarns` | Reply to a member's message to clear warning history |
| `/purge 10` | Delete up to 10 preceding messages (maximum 100) |
| `/pin` | Reply to the message to pin |
| `/unpin` | Unpin the current pinned message |
| `/setrules Be respectful and do not spam.` | Save group rules |
| `/welcome on` / `/welcome off` | Toggle welcome messages |

### Important permission notes

- Promote the bot to administrator and grant only the required permissions: delete messages, restrict/ban members, and pin messages.
- Telegram does not let a bot moderate group owners or administrators.
- `/purge` can only delete messages that Telegram allows the bot to delete.
- Welcome messages depend on Telegram delivering the new-member service update.
- The bot cannot bypass group restrictions or Telegram API limits.

## Project structure

```text
Serena-Group-Manager/
├── tgcloud/
│   ├── handlers/
│   │   ├── message.js
│   │   └── callback_query.js
│   ├── lib/
│   │   └── ui.js
│   └── schema.js
├── package.json
├── tgcloud.jsonc
├── README.md
└── deployment termux.md
```

Only runtime modules under the supported `tgcloud/` locations are deployed. Documentation, `package.json`, and local CLI state remain local.

## Update and redeploy

```bash
git pull origin main
cd Serena-Group-Manager
npm install
npx tgcloud status
npx tgcloud diff
npx tgcloud push
npx tgcloud migrate
npx tgcloud status
```

If you already are inside `Serena-Group-Manager`, run `git pull origin main` from the parent repository first, then return to this directory. See the deployment guide for exact commands for your terminal.

## Security

Never commit `.tgcloud/`, CLI tokens, Bot API tokens or private environment files. Before deploying moderation code to a live group, test in a private test group and confirm permissions and commands behave as expected.