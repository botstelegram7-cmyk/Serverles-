import { api, db } from 'sdk';
import { eq, and } from 'sdk/db';
import { groupSettings, warnings } from '../schema.js';
import { mainMenu, backMenu, HELP_TEXT, escapeHtml, displayName } from '../lib/ui.js';

const ADMIN_COMMANDS = new Set([
  'ban', 'unban', 'kick', 'mute', 'unmute', 'warn', 'warnings',
  'clearwarns', 'purge', 'pin', 'unpin', 'setrules', 'welcome',
]);

export default async function (message) {
  if (!message?.chat) return;

  const chat = message.chat;
  const from = message.from;
  const text = (message.text ?? '').trim();

  if (Array.isArray(message.new_chat_members) && message.new_chat_members.length) {
    return welcomeNewMembers(message);
  }

  if (!text.startsWith('/')) return;
  if (!from) return;

  const firstToken = text.split(/\s+/)[0];
  const command = firstToken.slice(1).split('@')[0].toLowerCase();
  const args = text.slice(firstToken.length).trim().split(/\s+/).filter(Boolean);

  try {
    if (command === 'start' || command === 'menu') {
      return send(chat.id,
        '<b>🛡 Serena Group Manager</b>\n\n' +
        'Your friendly group moderation assistant. Use the buttons below or type /help to see commands.',
        mainMenu);
    }

    if (command === 'help' || command === 'commands') {
      return send(chat.id, HELP_TEXT, backMenu);
    }

    if (command === 'version') {
      return send(chat.id, '<b>ℹ️ Serena Group Manager</b>\n<b>Version:</b> 1.0.0', backMenu);
    }

    if (command === 'status') return showStatus(message);

    if (command === 'id') {
      return send(chat.id,
        '<b>🆔 ID information</b>\n' +
        '<b>Chat ID:</b> <code>' + chat.id + '</code>\n' +
        '<b>Your user ID:</b> <code>' + from.id + '</code>' +
        (message.reply_to_message?.from ? '\n<b>Replied user ID:</b> <code>' + message.reply_to_message.from.id + '</code>' : ''),
        backMenu);
    }

    if (command === 'admins') return showAdmins(chat.id);
    if (command === 'rules') return showRules(chat.id);

    if (!ADMIN_COMMANDS.has(command)) {
      return send(chat.id, '🤔 Unknown command. Use /help to see available commands.', backMenu);
    }

    if (chat.type !== 'group' && chat.type !== 'supergroup') {
      return send(chat.id, '⚠️ This command works inside a group or supergroup.', backMenu);
    }

    if (!(await isAdmin(chat.id, from.id))) {
      return send(chat.id, '⛔ Only group administrators can use this command.');
    }

    switch (command) {
      case 'ban':
        return moderateTarget(message, 'ban');
      case 'unban':
        return moderateTarget(message, 'unban');
      case 'kick':
        return moderateTarget(message, 'kick');
      case 'mute':
        return moderateTarget(message, 'mute', args);
      case 'unmute':
        return moderateTarget(message, 'unmute');
      case 'warn':
        return addWarning(message, args.join(' '));
      case 'warnings':
        return showWarnings(message);
      case 'clearwarns':
        return clearWarnings(message);
      case 'purge':
        return purgeMessages(message, args);
      case 'pin':
        return pinRepliedMessage(message);
      case 'unpin':
        return unpinMessage(message);
      case 'setrules':
        return setRules(message, text.slice(firstToken.length).trim());
      case 'welcome':
        return setWelcome(message, args[0]);
      default:
        return send(chat.id, 'Use /help to see the available commands.');
    }
  } catch (error) {
    console.error('Serena Group Manager command failed:', command, error);
    return send(chat.id, '⚠️ Something went wrong. Check that the bot is an administrator with the required permissions.\n\n' +
      '<code>' + escapeHtml(error?.description || error?.message || 'Unknown error') + '</code>');
  }
}

async function send(chatId, text, keyboard) {
  return api.sendMessage({
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...(keyboard ? { reply_markup: keyboard } : {}),
    disable_web_page_preview: true,
  });
}

async function isAdmin(chatId, userId) {
  const member = await api.getChatMember({ chat_id: chatId, user_id: userId });
  return member.status === 'creator' || member.status === 'administrator';
}

async function requireReplyTarget(message) {
  const target = message.reply_to_message?.from;
  if (!target) {
    await send(message.chat.id, '↩️ Reply to the member’s message, then use this command.');
    return null;
  }
  if (target.is_bot) {
    await send(message.chat.id, '⚠️ This command cannot target a bot account.');
    return null;
  }
  if (target.id === message.from.id) {
    await send(message.chat.id, '⚠️ You cannot target yourself with this command.');
    return null;
  }
  const member = await api.getChatMember({ chat_id: message.chat.id, user_id: target.id });
  if (member.status === 'creator' || member.status === 'administrator') {
    await send(message.chat.id, '🛡 I will not moderate a group administrator.');
    return null;
  }
  return target;
}

async function moderateTarget(message, action, args = []) {
  const target = await requireReplyTarget(message);
  if (!target) return;
  const chatId = message.chat.id;
  const name = escapeHtml(displayName(target));
  const userId = target.id;

  if (action === 'ban') {
    await api.banChatMember({ chat_id: chatId, user_id: userId });
    return send(chatId, '🔨 <b>Member banned</b>\n' + name + ' (<code>' + userId + '</code>).');
  }

  if (action === 'unban') {
    await api.unbanChatMember({ chat_id: chatId, user_id: userId, only_if_banned: true });
    return send(chatId, '✅ Ban removed for ' + name + '.');
  }

  if (action === 'kick') {
    await api.banChatMember({ chat_id: chatId, user_id: userId });
    await api.unbanChatMember({ chat_id: chatId, user_id: userId, only_if_banned: true });
    return send(chatId, '👢 ' + name + ' was removed and can rejoin using a valid invite.');
  }

  if (action === 'mute') {
    const parsed = Number.parseInt(args[0] ?? '60', 10);
    const minutes = Number.isFinite(parsed) ? Math.min(10080, Math.max(1, parsed)) : 60;
    await api.restrictChatMember({
      chat_id: chatId,
      user_id: userId,
      until_date: Math.floor(Date.now() / 1000) + minutes * 60,
      use_independent_chat_permissions: true,
      permissions: {
        can_send_messages: false,
        can_send_audios: false,
        can_send_documents: false,
        can_send_photos: false,
        can_send_videos: false,
        can_send_video_notes: false,
        can_send_voice_notes: false,
        can_send_polls: false,
        can_send_other_messages: false,
        can_add_web_page_previews: false
      }
    });
    return send(chatId, '🔇 ' + name + ' was muted for ' + minutes + ' minute(s).');
  }

  if (action === 'unmute') {
    await api.restrictChatMember({
      chat_id: chatId,
      user_id: userId,
      use_independent_chat_permissions: true,
      permissions: {
        can_send_messages: true,
        can_send_audios: true,
        can_send_documents: true,
        can_send_photos: true,
        can_send_videos: true,
        can_send_video_notes: true,
        can_send_voice_notes: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true
      }
    });
    return send(chatId, '🔊 Sending permissions restored for ' + name + '.');
  }
}

async function addWarning(message, reason) {
  const target = await requireReplyTarget(message);
  if (!target) return;
  await db.insert(warnings).values({
    chatId: message.chat.id,
    userId: target.id,
    adminId: message.from.id,
    reason: reason || 'No reason provided',
  }).run();

  const rows = await db.select({ id: warnings.id })
    .from(warnings)
    .where(and(eq(warnings.chatId, message.chat.id), eq(warnings.userId, target.id)))
    .all();
  return send(message.chat.id,
    '⚠️ <b>Warning recorded</b>\n' +
    '<b>Member:</b> ' + escapeHtml(displayName(target)) + '\n' +
    '<b>Total warnings:</b> ' + rows.length + '\n' +
    '<b>Reason:</b> ' + escapeHtml(reason || 'No reason provided'));
}

async function showWarnings(message) {
  const target = await requireReplyTarget(message);
  if (!target) return;
  const rows = await db.select({ reason: warnings.reason, createdAt: warnings.createdAt })
    .from(warnings)
    .where(and(eq(warnings.chatId, message.chat.id), eq(warnings.userId, target.id)))
    .all();
  const latest = rows.slice(-5).map((row, index) =>
    (index + 1) + '. ' + escapeHtml(row.reason || 'No reason provided')
  ).join('\n');
  return send(message.chat.id,
    '📋 <b>Warning history</b>\n' +
    '<b>Member:</b> ' + escapeHtml(displayName(target)) + '\n' +
    '<b>Total:</b> ' + rows.length + '\n' +
    (latest ? '\n' + latest : 'No warnings recorded.'));
}

async function clearWarnings(message) {
  const target = await requireReplyTarget(message);
  if (!target) return;
  await db.delete(warnings)
    .where(and(eq(warnings.chatId, message.chat.id), eq(warnings.userId, target.id)))
    .run();
  return send(message.chat.id, '✅ Cleared warning history for ' + escapeHtml(displayName(target)) + '.');
}

async function purgeMessages(message, args) {
  const parsed = Number.parseInt(args[0] ?? '10', 10);
  const count = Number.isFinite(parsed) ? Math.min(100, Math.max(1, parsed)) : 10;
  let deleted = 0;
  for (let offset = 1; offset <= count; offset++) {
    const messageId = message.message_id - offset;
    if (messageId < 1) break;
    try {
      await api.deleteMessage({ chat_id: message.chat.id, message_id: messageId });
      deleted++;
    } catch (_) {
      // Messages may be too old, already deleted, or inaccessible.
    }
  }
  try { await api.deleteMessage({ chat_id: message.chat.id, message_id: message.message_id }); } catch (_) {}
  return send(message.chat.id, '🧹 Purge finished. Deleted ' + deleted + ' message(s).');
}

async function pinRepliedMessage(message) {
  const targetMessage = message.reply_to_message;
  if (!targetMessage) return send(message.chat.id, '↩️ Reply to the message you want to pin, then send /pin.');
  await api.pinChatMessage({ chat_id: message.chat.id, message_id: targetMessage.message_id });
  return send(message.chat.id, '📌 Message pinned.');
}

async function unpinMessage(message) {
  await api.unpinChatMessage({ chat_id: message.chat.id });
  return send(message.chat.id, '📌 The pinned message was unpinned.');
}

async function showStatus(message) {
  const chatId = message.chat.id;
  const me = await api.getMe();
  const botMember = (message.chat.type === 'group' || message.chat.type === 'supergroup')
    ? await api.getChatMember({ chat_id: chatId, user_id: me.id })
    : null;
  const settings = (message.chat.type === 'group' || message.chat.type === 'supergroup')
    ? await getSettings(chatId)
    : null;
  const lines = [
    '<b>🩺 Serena Group Manager status</b>',
    '<b>Version:</b> 1.0.0',
    '<b>Bot:</b> ' + escapeHtml(me.username ? '@' + me.username : me.first_name),
  ];
  if (botMember) {
    lines.push('<b>Group role:</b> ' + escapeHtml(botMember.status));
    if (botMember.status === 'administrator' || botMember.status === 'creator') {
      lines.push('<b>Delete messages:</b> ' + (botMember.can_delete_messages ? '✅' : '❌'));
      lines.push('<b>Restrict members:</b> ' + (botMember.can_restrict_members ? '✅' : '❌'));
      lines.push('<b>Pin messages:</b> ' + (botMember.can_pin_messages ? '✅' : '❌'));
    }
    lines.push('<b>Welcome:</b> ' + (settings?.welcome === false ? 'OFF' : 'ON'));
  } else {
    lines.push('Add the bot to a group and promote it to admin to use moderation commands.');
  }
  return send(chatId, lines.join('\n'), backMenu);
}

async function showAdmins(chatId) {
  const admins = await api.getChatAdministrators({ chat_id: chatId });
  const list = admins.map((item) => {
    const user = item.user;
    const name = escapeHtml(displayName(user));
    return '• ' + name + (user.username ? ' (@' + escapeHtml(user.username) + ')' : '');
  }).join('\n');
  return send(chatId, '<b>👮 Group administrators</b>\n\n' + (list || 'No administrators found.'), backMenu);
}

async function getSettings(chatId) {
  return db.select().from(groupSettings).where(eq(groupSettings.chatId, chatId)).get();
}

async function showRules(chatId) {
  if (typeof chatId !== 'number') return;
  const settings = await getSettings(chatId);
  return send(chatId, '<b>📋 Group rules</b>\n\n' +
    escapeHtml(settings?.rules || 'No rules have been set. An admin can use /setrules to add them.'), backMenu);
}

async function setRules(message, rulesText) {
  if (!rulesText) return send(message.chat.id, 'Usage: <code>/setrules Be respectful and do not spam.</code>');
  const existing = await getSettings(message.chat.id);
  await db.insert(groupSettings).values({
    chatId: message.chat.id,
    rules: rulesText,
    welcome: existing?.welcome ?? true,
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: groupSettings.chatId,
    set: { rules: rulesText, updatedAt: new Date() },
  }).run();
  return send(message.chat.id, '✅ Group rules updated. Members can view them with /rules.');
}

async function setWelcome(message, value) {
  const normalized = String(value || '').toLowerCase();
  if (!['on', 'off'].includes(normalized)) {
    return send(message.chat.id, 'Usage: <code>/welcome on</code> or <code>/welcome off</code>');
  }
  const existing = await getSettings(message.chat.id);
  const enabled = normalized === 'on';
  await db.insert(groupSettings).values({
    chatId: message.chat.id,
    rules: existing?.rules,
    welcome: enabled,
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: groupSettings.chatId,
    set: { welcome: enabled, updatedAt: new Date() },
  }).run();
  return send(message.chat.id, '✅ New-member welcome messages are now <b>' + (enabled ? 'ON' : 'OFF') + '</b>.');
}

async function welcomeNewMembers(message) {
  const settings = await getSettings(message.chat.id);
  if (settings?.welcome === false) return;
  const names = message.new_chat_members
    .filter((user) => !user.is_bot)
    .map((user) => escapeHtml(displayName(user)));
  if (!names.length) return;
  return send(message.chat.id,
    '👋 Welcome ' + names.join(', ') + '!\nPlease read /rules and keep the group friendly.',
    mainMenu);
}