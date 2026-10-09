// tgcloud/lib/text.js — Reusable message strings (welcome, help, etc.).
// Keeping text in one place makes it easy to edit or localize later.

/** Build the rich welcome message shown on /start. */
export function welcomeMessage(user) {
  const name = user?.first_name ? escapeHtml(user.first_name) : 'there';
  return (
    `👋 <b>Welcome, ${name}!</b>\n\n` +
    `I'm a <b>Telegram Serverless</b> demo bot — I run entirely on Telegram's ` +
    `infrastructure. No VPS, no containers, no webhooks to configure.\n\n` +
    `Here's what I can do right now:\n` +
    `  • /start — show this welcome message\n` +
    `  • /help  — learn what I understand\n` +
    `  • /stats — see how many messages you've sent\n` +
    `  • Say anything — I'll echo it back and keep a count\n\n` +
    `Tap a button below, or just send me a message. 🚀`
  );
}

export const HELP_TEXT =
  `🛠 <b>What I can do</b>\n\n` +
  `<b>Commands</b>\n` +
  `  /start — Welcome screen & main menu\n` +
  `  /help  — This help message\n` +
  `  /stats — Your personal message counter\n` +
  `  /about — About Telegram Serverless\n\n` +
  `<b>Buttons</b>\n` +
  `  The inline keyboard under the welcome message gives quick access\n` +
  `  to the most common actions.\n\n` +
  `<b>Anything else</b>\n` +
  `  Send me any text and I'll echo it back while counting messages\n` +
  `  in my built-in SQLite database.`;

export const ABOUT_TEXT =
  `☁️ <b>About Telegram Serverless</b>\n\n` +
  `This bot runs directly on Telegram's infrastructure in a fast V8 sandbox\n` +
  `right next to the Bot API, with a built-in SQLite database.\n\n` +
  `Deployment is a single command:\n` +
  `<code>npx tgcloud push</code>\n\n` +
  `📚 Docs: https://core.telegram.org/bots/serverless\n` +
  `💬 Feedback: @BotSupport (use #serverless)`;

export function statsMessage(user, count) {
  const name = user?.first_name ? escapeHtml(user.first_name) : 'You';
  return (
    `📊 <b>Your stats</b>\n\n` +
    `${name}, I've seen <b>${count}</b> message${count === 1 ? '' : 's'} from you ` +
    `so far. Every message is stored in the built-in SQLite database — ` +
    `no external server needed.`
  );
}

export const ECHO_PREFIX = '🔁 You said:';
export const BUTTON_THANKS = '✅ Thanks for tapping! Try another button or send me a message.';

/** Escape 5 special chars for Telegram's HTML parse_mode. */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
