# Telegram Serverless — Practical Guide

This guide explains the platform model and the safe day-to-day workflow for projects using the `@tgcloud/cli`. For the exact SDK API, use [tgcloud-sdk.md](tgcloud-sdk.md). For commands on different terminals, use [TERMINAL_DEPLOYMENT.md](TERMINAL_DEPLOYMENT.md).

> Platform features and command options can evolve. Check the official [Telegram Serverless documentation](https://blogfork.telegram.org/bots/serverless) and [Telegram Bot API](https://core.telegram.org/bots/api) before relying on a newly introduced feature.

## 1. What Telegram Serverless does

Telegram Serverless runs supported bot backend modules on Telegram's infrastructure. You edit code locally, use the `tgcloud` CLI to deploy it, and Telegram invokes the matching module when a supported update arrives.

It removes the need to maintain your own always-on bot process, VPS, container, or manually configured webhook for supported workflows. Your terminal is a development and deployment tool; it does not need to remain open for the deployed bot to keep running.

A project has three distinct parts:

1. **Local project** — source files, package scripts, configuration and local CLI state.
2. **Deployed modules** — the JavaScript modules that Telegram executes.
3. **Persistent database and hosted assets** — the built-in database and optional Mini App build, managed separately from local source files.

## 2. Requirements

- A Telegram bot created with [@BotFather](https://t.me/BotFather).
- Serverless enabled for that bot in BotFather.
- Node.js 18 or newer and npm.
- Git (for cloning and updating a GitHub project).
- The **CLI Access token** from BotFather → your bot → Serverless → CLI Access.
- A supported terminal such as Termux, Linux, macOS, Windows PowerShell or a CI environment.

The CLI Access token is **not** the regular Telegram Bot API token. Keep both secret.

## 3. Create a new project

Recommended scaffold:

```bash
npm create @tgcloud/bot my-bot
cd my-bot
npm install
npx tgcloud login
npx tgcloud status
npx tgcloud push
npx tgcloud migrate
```

To scaffold into the current directory, the project creator accepts `.` as the target. It is designed not to overwrite existing files.

For this repository, there are two separate projects:
- The Welcome Bot at the repository root.
- Serena Group Manager in `Serena-Group-Manager/`.

Do not run a deploy command from the parent directory when you mean to deploy the Serena subproject, or vice versa.

## 4. Project layout

A typical project looks like:

```text
project/
├── tgcloud/
│   ├── handlers/       # One module per Telegram update type
│   ├── lib/            # Shared project modules
│   ├── endpoints/      # Mini App backend functions (optional)
│   └── schema.js       # Named database table declarations
├── docs/               # Local documentation
├── package.json        # CLI dependency and scripts
├── tgcloud.jsonc       # Project and optional static-site configuration
├── AGENTS.md           # Project-specific development conventions
└── .tgcloud/           # Local CLI state; never commit or edit manually
```

The exact contents vary by project. Only supported JavaScript modules under `tgcloud/schema.js`, `tgcloud/lib/`, `tgcloud/handlers/` and `tgcloud/endpoints/` are deployed as modules. When a static Mini App is configured, its build output can also be deployed.

Markdown, the package manifest, local dependencies and `.tgcloud/` are not runtime modules.

## 5. How updates reach your code

The platform matches incoming Telegram update types to handler modules. Examples:

| Module | Receives |
|---|---|
| `handlers/message.js` | A Telegram Message |
| `handlers/callback_query.js` | An inline-keyboard CallbackQuery |
| `handlers/inline_query.js` | An InlineQuery, if implemented |

A handler's first argument is the matching payload, not the full raw Update. The second argument is the invocation context; `ctx.update` contains the raw update when needed.

Handlers should export a default function:

```js
import { api } from 'sdk';

export default async function (message) {
  await api.sendMessage({
    chat_id: message.chat.id,
    text: 'Hello from Telegram Serverless!',
  });
}
```

Only create the handlers your bot needs. An update without a matching handler is ignored.

## 6. Runtime rules — read before coding

The Serverless runtime is not an ordinary Node.js server.

- Use the platform SDK, imported from `sdk`, `sdk/db`, `sdk/api` or `sdk/fetch`.
- Import your own project modules by relative path and include the `.js` extension, e.g. `import { users } from '../schema.js'`.
- Do not expect arbitrary npm packages to resolve at runtime. `@tgcloud/cli` is a local development/deployment tool; it is not shipped as a runtime dependency.
- Do not rely on local filesystem access, long-running processes, background timers or in-memory variables for persistent state.
- Use `await` for database calls; the query methods are asynchronous.
- The platform documents no foreign-key support in its schema DSL; enforce relationships in application code.
- Use the SDK's `fetch` for outbound HTTP from modules.
- Keep handler work bounded and handle expected Telegram API failures.

Check [tgcloud-sdk.md](tgcloud-sdk.md) for exact signatures and examples.

## 7. The built-in database

Each bot has a persistent SQLite-backed database. Declare tables as named exports in `tgcloud/schema.js` and query them through `db`.

Example:

```js
import { table, integer, text, sql } from 'sdk/db';

export const notes = table('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  chatId: integer('chat_id').notNull(),
  body: text('body').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`),
});
```

Database operations are asynchronous:

```js
import { db } from 'sdk';
import { eq } from 'sdk/db';
import { notes } from '../schema.js';

const rows = await db.select().from(notes).where(eq(notes.chatId, 123)).all();
```

### Code deploy and database migration are separate

```bash
npx tgcloud push
npx tgcloud migrate
```

- `push` deploys modules and reports pending schema changes. It does not apply database migrations.
- `migrate` computes the schema difference and asks before applying changes.
- Review destructive warnings carefully; do not automatically approve a drop you do not understand.
- `npx tgcloud migrate --dry-run` previews changes without applying them.

Do not delete schema declarations expecting that to automatically drop existing database objects. Follow the official migration guidance for deprecating or manually changing tables and columns.

## 8. CLI commands

Run commands from the relevant project's root directory.

| Command | Purpose |
|---|---|
| `npx tgcloud login` | Link the local project to a bot and save credentials locally |
| `npx tgcloud status` | Show local changes compared with the last synced cloud state |
| `npx tgcloud diff` | Show line-by-line module differences |
| `npx tgcloud push` | Deploy project changes |
| `npx tgcloud migrate` | Review and apply schema changes |
| `npx tgcloud migrate --dry-run` | Preview database changes |
| `npx tgcloud run handlers/message '{...}'` | Execute a handler against a supplied test payload without deploying |
| `npx tgcloud add handlers/inline_query` | Scaffold a supported module |
| `npx tgcloud fetch` | Check deployed state without changing local files |
| `npx tgcloud pull` | Bring local files in line with cloud state |
| `npx tgcloud webhook` | Inspect or re-sync platform-managed webhook state |
| `npx tgcloud upgrade` | Upgrade a project created with a pre-0.2.0 layout |

The CLI version in the project determines which commands/options are available. If a command is rejected, run `npx tgcloud --help` and consult the current official docs rather than guessing flags.

## 9. Recommended deployment workflow

Use this sequence for routine updates:

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

Review the status/diff before pushing if you have local edits. Run `migrate` only after reviewing the pending schema changes. If no schema changes are pending, the CLI will report that.

### If another device deployed first

The CLI tracks the cloud revision and may reject a push if the cloud changed since your last sync. Prefer reconciling state:

```bash
npx tgcloud fetch
npx tgcloud status
npx tgcloud pull
npx tgcloud diff
```

Review what changed before deploying. `npx tgcloud push --force` can overwrite newer cloud state; use it only when you deliberately intend to replace that state and have reviewed the consequences.

## 10. Mini App hosting and endpoints

A Mini App is optional. If a project includes a front-end, the front-end is built using its normal toolchain (for example Vite) and the build output can be hosted alongside the bot.

A configuration may identify the build folder in `tgcloud.jsonc`:

```json
{
  "$schema": "./node_modules/@tgcloud/cli/schema/tgcloud.json",
  "static": {
    "source": "dist",
    "spa": true
  }
}
```

Build the front-end before deploying it. `npx tgcloud push` does not run the build itself. Some project templates provide an `npm run deploy` script that builds and then pushes; check that project's `package.json` before relying on it.

Files in `tgcloud/endpoints/` provide backend functions for Mini App calls. Consult the official guide for verified init data, endpoint semantics, hosting configuration and current platform limits.

## 11. Authentication and secrets

Interactive login:

```bash
npx tgcloud login
```

The CLI stores project credentials in `.tgcloud/`, which must remain local and git-ignored. The CI option is the `TGCLOUD_TOKEN` environment variable. Avoid putting a token literally in shell history or source code.

Temporary shell environment variable example:

```bash
read -rsp "CLI Access token: " TGCLOUD_TOKEN
echo
export TGCLOUD_TOKEN
npx tgcloud status
npx tgcloud push
unset TGCLOUD_TOKEN
```

Use the interactive login when possible. Never share tokens in chats, issue reports, screenshots, or commits. If a token may have leaked, rotate/revoke it through the appropriate BotFather controls.

## 12. Troubleshooting

### “No CLI access token found”
- Change into the intended project directory.
- Run `npx tgcloud login`.
- Use the **CLI Access token**, not the regular Bot API token.
- Check that the local `.tgcloud/` folder was not deleted and that you are not in a different project folder.

### Bot does not respond after a successful push
- Check `npx tgcloud status` and `npx tgcloud webhook`.
- Confirm you linked the correct bot.
- Confirm the relevant handler is under `tgcloud/handlers/` and has a default export.
- Test a handler with `npx tgcloud run` before deploying.
- Check the platform's current error/status output.

### Module import error
- Ensure relative project imports include `.js`.
- Import only modules inside the project's supported runtime tree.
- Do not import arbitrary npm packages from deployed modules.

### Database schema mismatch
- Run `npx tgcloud status`, then `npx tgcloud push`, and review `npx tgcloud migrate --dry-run`.
- Apply only the intended migration after reviewing the prompts.

### Push rejected due to cloud revision
- Run `npx tgcloud fetch`, inspect the differences, then `pull` if appropriate.
- Avoid `--force` unless overwriting cloud state is deliberate.

### Local CLI state seems missing
- Confirm the project folder.
- Do not manually edit `.tgcloud/` files. Re-run `npx tgcloud login` if necessary.
- Never use `git clean -fdx` as a first troubleshooting step; it can delete local dependencies and ignored credentials.

## 13. Official references

- [Telegram Serverless guide](https://blogfork.telegram.org/bots/serverless)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [BotFather](https://t.me/BotFather)
- [Local SDK reference](tgcloud-sdk.md)

This guide is an operational summary, not a replacement for the official docs. Always verify newly added features and limits against the current platform reference.