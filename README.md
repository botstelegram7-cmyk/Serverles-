# Telegram Serverless Welcome Bot

> A professional Telegram bot that runs entirely on Telegram's own infrastructure —
> no VPS, no containers, no webhook configuration. Built with the official
> [Telegram Serverless](https://core.telegram.org/bots/serverless) platform (`tgcloud`).

When a user opens the bot and taps **Start** (or sends `/start`), the bot
replies with a rich welcome message, an inline menu, and persists the user in
its built-in SQLite database. It also supports `/help`, `/about`, `/stats`,
button callbacks, and echoes other messages while counting them per user.

---

## ✨ Features

- 🎬 **/start welcome screen** — rich HTML greeting addressed to the user, with an inline keyboard menu.
- 🛠 **/help**, **/about**, **/stats** commands — each with its own view and a ⬅️ Back button.
- 🔘 **Inline keyboard callbacks** — actions routed through `handlers/callback_query.js`.
- 🗄 **Built-in SQLite database** — `users` table tracks every visitor, their language, and their message count.
- 🔁 **Echo mode** — any non-command message is echoed back with a counter update.
- ⚡ **Zero infrastructure** — deploys to Telegram's cloud with one command.

---

## 📁 Project layout

```
.
├── tgcloud/                     # Everything the platform runs lives here
│   ├── handlers/
│   │   ├── message.js           # New incoming messages (including /start)
│   │   └── callback_query.js    # Inline keyboard button presses
│   ├── lib/
│   │   ├── text.js              # Reusable message strings (welcome, help, about, stats)
│   │   └── keyboards.js         # Reusable inline keyboards
│   └── schema.js                # SQLite schema (users table)
├── docs/
│   └── tgcloud-sdk.md           # Full SDK reference (auto-included by the scaffold)
├── tgcloud.jsonc                # Project configuration
├── AGENTS.md                    # Orientation for AI coding assistants
├── package.json                 # Dev scripts + @tgcloud/cli
└── README.md
```

Only `.js` files under `tgcloud/` (`schema.js`, `lib/`, `handlers/`, `endpoints/`)
are deployed. Markdown, config, `node_modules`, and `.tgcloud/` stay local.

---

## 🚀 Getting started

### Prerequisites

- **Node.js 18+**
- A Telegram bot registered with [@BotFather](https://t.me/BotFather).
- **Early access to Telegram Serverless** — in @BotFather, open your bot →
  **Serverless** → turn it on. You'll see the message quoted at the top of this
  repo confirming early access.

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/<repo>.git
cd <repo>
npm install
```

### 2. Link the project to your bot

The **CLI access token** is *separate* from your bot's HTTP API token. Get it
from @BotFather → your bot → **Serverless** → **CLI Access** → **Access token**,
then run:

```bash
npx tgcloud login
```

Paste the CLI token when prompted. It is saved locally in `.tgcloud/credentials`
(which is gitignored — never commit it).

> 💡 For CI you can set `TGCLOUD_TOKEN=<cli-token>` in the environment instead.

### 3. Deploy

```bash
npx tgcloud push       # Upload your handler modules to the cloud
npx tgcloud migrate    # Create the `users` table in the built-in database
```

That's it. Open your bot in Telegram, press **Start**, and you should see the
welcome message with the main menu.

### 4. Check status

```bash
npx tgcloud status     # Shows local vs. cloud revision
npx tgcloud webhook    # Confirms the platform-managed webhook is wired up
```

---

## 🧪 Try it without deploying

The `run` command executes a handler against your local files on the platform,
without publishing them:

```bash
npx tgcloud run handlers/message '{ "chat": { "id": 123, "type": "private" }, "from": { "id": 123, "first_name": "Ada" }, "text": "/start" }'
```

---

## 🧩 Customising the bot

| What to change              | Where                                   |
|-----------------------------|-----------------------------------------|
| Welcome / help / about text | [`tgcloud/lib/text.js`](tgcloud/lib/text.js) |
| Inline buttons              | [`tgcloud/lib/keyboards.js`](tgcloud/lib/keyboards.js) |
| Message routing & commands  | [`tgcloud/handlers/message.js`](tgcloud/handlers/message.js) |
| Button-press handling       | [`tgcloud/handlers/callback_query.js`](tgcloud/handlers/callback_query.js) |
| Database schema             | [`tgcloud/schema.js`](tgcloud/schema.js) |

After changing the schema, run `npx tgcloud push` then `npx tgcloud migrate`.

### Adding a new command

1. Add a handler in `tgcloud/handlers/message.js` (see how `COMMANDS.help` is
   defined) or register it in the `COMMANDS` map.
2. If you want a button for it, add an entry in `tgcloud/lib/keyboards.js` and
   wire the matching `action:` case in `handlers/callback_query.js`.
3. `npx tgcloud push`.

---

## 📚 Useful commands

| Command                    | What it does                                       |
|----------------------------|----------------------------------------------------|
| `npm run push`             | Deploy changed modules to Telegram's cloud         |
| `npm run migrate`          | Apply pending database schema changes              |
| `npm run status`           | Show local vs. cloud revision                      |
| `npm run diff`             | Line-by-line diff of local vs. cloud               |
| `npx tgcloud run <module>` | Run a handler locally without deploying            |
| `npx tgcloud webhook`      | Inspect / re-sync the platform-managed webhook     |
| `npx tgcloud login`        | Link a different bot (saves a new CLI token)       |
| `npx tgcloud pull`         | Restore local files from the cloud state           |

---

## 🔒 Security notes

- `.tgcloud/` is **gitignored**. It contains your CLI access token and local
  state — never commit it.
- The CLI access token is scoped to managing one bot; it is not your bot's HTTP
  API token and can be rotated from @BotFather at any time.
- The runtime has **no filesystem access** and **no npm packages** — only the
  official `sdk` and your own modules under `tgcloud/`.

---

## 📖 References

- Telegram Serverless documentation: https://core.telegram.org/bots/serverless
- Telegram Bot API reference: https://core.telegram.org/bots/api
- Local SDK reference (full): [`docs/tgcloud-sdk.md`](docs/tgcloud-sdk.md)
- Orientation for AI assistants: [`AGENTS.md`](AGENTS.md)
- Feedback to Telegram: [@BotSupport](https://t.me/BotSupport) with `#serverless`

---

## 📝 License

MIT — see [`LICENSE`](LICENSE).
