// tgcloud/lib/text.js — Reusable message strings (welcome, help, etc.).
// Keeping text in one place makes it easy to edit or localize later.

/** Build the rich welcome message shown on /start. */
export function welcomeMessage(user) {
  const name = user?.first_name ? escapeHtml(user.first_name) : 'there';
  return (
    `👋 <b>Welcome, ${name}!</b>\n\n` +
    `I'm your helpful Telegram bot.\n\n` +
    `Here's what I can do right now:\n` +
    `  • /start — show this welcome message\n` +
    `  • /help  — learn what I understand\n` +
    `  • /stats — see your message stats\n` +
    `  • /version — show the current bot version\n` +
    `  • Say anything — I'll echo it back\n\n` +
    `Tap a button below, or just send me a message. 🚀`
  );
}

export const HELP_TEXT =
  `🛠 <b>What I can do</b>\n\n` +
  `<b>Commands</b>\n` +
  `  /start — Welcome screen & main menu\n` +
  `  /help  — This help message\n` +
  `  /stats — Your personal message counter\n` +
  `  /about — About this bot\n` +
  `  /version — Current bot version\n\n` +
  `<b>Buttons</b>\n` +
  `  The inline keyboard under the welcome message gives quick access\n` +
  `  to the most common actions.\n\n` +
  `<b>Anything else</b>\n` +
  `  Send me any text and I'll echo it back while counting messages\n` +
  `  in my built-in SQLite database.`;

export const ABOUT_TEXT =
  `🤖 <b>About this bot</b>\n\n` +
  `I can show this welcome screen, explain commands, display your message stats,\n` +
  `and echo text messages. Use /help to see the available commands.`;

export const VERSION_TEXT =\n  `ℹ️ <b>Bot version</b>\\n\\n` +\n  `<b>Version:</b> 1.0.0`;\n\nexport function statsMessage(user, count) {
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
