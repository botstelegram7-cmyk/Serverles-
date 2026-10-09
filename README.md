# Telegram Serverless Bot Projects

Production-minded starter code and documentation for bots running on [Telegram Serverless](https://blogfork.telegram.org/bots/serverless) with the `@tgcloud/cli`.

This repository contains **two independently deployable projects**. Each project has its own `package.json`, `tgcloud/` source tree, CLI state and deployment lifecycle.

## Projects

### 1. Telegram Serverless Welcome Bot — repository root

A starter bot demonstrating message handlers, inline keyboards, command routing and persistent SQLite-backed user statistics.

- `/start`, `/help`, `/about`, `/stats`, `/version`
- Inline keyboard callbacks
- Persistent user records and message counts
- A small, readable codebase for learning Serverless handlers

Start here: the root `package.json` and `tgcloud/` folder.

### 2. Serena Group Manager — `Serena-Group-Manager/`

A separate group administration bot with moderation commands, persistent rules and warning records, welcome settings, admin tools and a button-based help menu.

- Ban, unban, kick, timed mute and unmute
- Warnings, warning history and clearing warnings
- Message purge and pin management
- Group rules and welcome-message settings
- Admin list, chat ID, version and permission status
- Dedicated setup guide: [Serena Group Manager README](Serena-Group-Manager/README.md)
- Android setup and deploy instructions: [deployment termux.md](Serena-Group-Manager/deployment%20termux.md)

**The two projects are not deployed together.** Run CLI commands from the project folder you intend to deploy and log each project into its own Telegram Serverless bot.

## Quick start

### Requirements

- Node.js 18 or newer and npm
- Git
- A Telegram bot created with [@BotFather](https://t.me/BotFather)
- Telegram Serverless enabled for that bot
- The bot's **CLI Access token** from BotFather → your bot → Serverless → CLI Access

The CLI Access token is different from the regular Telegram Bot API token. Never commit either secret.

### Deploy the Welcome Bot (repository root)

```bash
git clone https://github.com/botstelegram7-cmyk/Serverles-.git
cd Serverles-
npm install
npx tgcloud login
npx tgcloud status
npx tgcloud push
npx tgcloud migrate
npx tgcloud webhook
```

### Deploy Serena Group Manager

From the repository root:

```bash
cd Serena-Group-Manager
npm install
npx tgcloud login
npx tgcloud status
npx tgcloud push
npx tgcloud migrate
npx tgcloud webhook
```

On first deployment, follow the CLI prompts and review migration changes before confirming. Do not run these commands from the wrong project folder.

## Documentation

| Guide | Purpose |
|---|---|
| [Telegram Serverless guide](docs/TELEGRAM_SERVERLESS_GUIDE.md) | Platform model, features, runtime, database, Mini Apps, deployment lifecycle and security |
| [Terminal deployment guide](docs/TERMINAL_DEPLOYMENT.md) | Termux, Linux, macOS and Windows PowerShell commands |
| [tgcloud SDK reference](docs/tgcloud-sdk.md) | Database, Bot API, HTTP, files and runtime API details |
| [Serena Group Manager guide](Serena-Group-Manager/README.md) | Moderation commands, permissions and bot usage |
| [Serena Termux guide](Serena-Group-Manager/deployment%20termux.md) | Serena-specific install, update, redeploy and troubleshooting |
| [AGENTS.md](AGENTS.md) | Project layout and implementation rules |

## Project layout

```text
.
├── tgcloud/                       # Welcome Bot runtime modules
│   ├── handlers/
│   ├── lib/
│   └── schema.js
├── docs/
│   ├── TELEGRAM_SERVERLESS_GUIDE.md
│   ├── TERMINAL_DEPLOYMENT.md
│   └── tgcloud-sdk.md
├── Serena-Group-Manager/          # Independent group-management bot
│   ├── tgcloud/
│   │   ├── handlers/
│   │   ├── lib/
│   │   └── schema.js
│   ├── package.json
│   ├── README.md
│   └── deployment termux.md
├── tgcloud.jsonc
├── package.json
└── README.md
```

## Core deployment rules

1. `npx tgcloud login` links the **current project folder** to a bot and stores credentials in that folder's ignored `.tgcloud/` directory.
2. `npx tgcloud status` and `npx tgcloud diff` help review local changes before deployment.
3. `npx tgcloud push` deploys code. It does **not** apply database migrations.
4. `npx tgcloud migrate` reviews and applies pending schema changes. Review potentially destructive changes carefully.
5. The Serverless runtime is not ordinary Node.js: deployed modules use the platform SDK and project modules, not arbitrary npm packages or filesystem access.
6. The bot runs on Telegram's infrastructure after deployment; Termux or another terminal does not need to remain open.

## Security

- Keep `.tgcloud/`, bot tokens, CLI tokens and local `.env` files out of Git.
- Never paste credentials into issues, chats, screenshots or committed files.
- Grant group-management bots only the administrator permissions they actually need.
- Review code and migration output before deploying to a live bot.

## References

- [Telegram Serverless documentation](https://blogfork.telegram.org/bots/serverless)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [BotFather](https://t.me/BotFather)

## License

MIT. See [LICENSE](LICENSE).