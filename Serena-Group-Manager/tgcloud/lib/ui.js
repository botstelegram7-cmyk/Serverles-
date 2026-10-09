export const mainMenu = {
  inline_keyboard: [
    [
      { text: '🛡 Moderation', callback_data: 'sgm:moderation', style: 'primary' },
      { text: '📋 Rules', callback_data: 'sgm:rules', style: 'success' },
    ],
    [
      { text: '👮 Admins', callback_data: 'sgm:admins', style: 'primary' },
      { text: '🆔 Chat ID', callback_data: 'sgm:id', style: 'success' },
    ],
    [
      { text: '❓ Help & Commands', callback_data: 'sgm:help', style: 'primary' },
    ],
  ],
};

export const backMenu = {
  inline_keyboard: [
    [
      { text: '⬅️ Main menu', callback_data: 'sgm:start', style: 'primary' },
      { text: '❔ Help', callback_data: 'sgm:help', style: 'success' },
    ],
  ],
};

export const HELP_TEXT =
  '<b>🛡 Serena Group Manager</b>\n\n' +
  '<b>General</b>\n' +
  '/start — Open the menu\n' +
  '/help — Show this guide\n' +
  '/id — Show chat and your user ID\n' +
  '/version — Show bot version\n' +
  '/status — Check bot permissions and group settings\n' +
  '/admins — List group admins\n' +
  '/rules — View group rules\n\n' +
  '<b>Admin commands</b> (reply to a member’s message)\n' +
  '/ban — Ban a member\n' +
  '/unban — Remove a ban (reply to a message from that user)\n' +
  '/kick — Remove a member but allow them to return\n' +
  '/mute [minutes] — Mute for 60 minutes by default\n' +
  '/unmute — Restore sending permissions\n' +
  '/warn [reason] — Add a warning\n' +
  '/warnings — View warning history\n' +
  '/clearwarns — Clear warning history\n' +
  '/purge [1-100] — Delete recent messages before the command\n' +
  '/pin — Pin the replied-to message\n' +
  '/unpin — Unpin the current pinned message\n' +
  '/setrules &lt;text&gt; — Set the group rules\n' +
  '/welcome on|off — Toggle new-member welcome messages\n\n' +
  'The bot must be an administrator with the required permissions.';

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function displayName(user) {
  if (!user) return 'Unknown user';
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return name || (user.username ? '@' + user.username : String(user.id ?? 'Unknown user'));
}