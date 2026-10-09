import { api, db } from 'sdk';
import { eq } from 'sdk/db';
import { groupSettings } from '../schema.js';
import { mainMenu, backMenu, HELP_TEXT, escapeHtml, displayName } from '../lib/ui.js';

export default async function (callback) {
  try {
    await api.answerCallbackQuery({ callback_query_id: callback.id });
  } catch (_) {}

  const data = callback.data || '';
  if (!data.startsWith('sgm:')) return;

  const action = data.slice(4);
  const chatId = callback.message?.chat?.id;
  const chat = callback.message?.chat;
  if (!chatId || !chat) return;

  try {
    if (action === 'start') {
      return send(chatId,
        '<b>🛡 Serena Group Manager</b>\n\nYour friendly group moderation assistant. Choose an option below.',
        mainMenu);
    }

    if (action === 'help' || action === 'moderation') {
      return send(chatId, HELP_TEXT, backMenu);
    }

    if (action === 'id') {
      return send(chatId,
        '<b>🆔 ID information</b>\n' +
        '<b>Chat ID:</b> <code>' + chatId + '</code>\n' +
        '<b>Your user ID:</b> <code>' + callback.from.id + '</code>',
        backMenu);
    }

    if (action === 'rules') {
      const settings = await db.select().from(groupSettings)
        .where(eq(groupSettings.chatId, chatId)).get();
      return send(chatId,
        '<b>📋 Group rules</b>\n\n' +
        escapeHtml(settings?.rules || 'No rules have been set. A group admin can use /setrules to add them.'),
        backMenu);
    }

    if (action === 'admins') {
      if (chat.type !== 'group' && chat.type !== 'supergroup') {
        return send(chatId, 'Add me to a group to view its administrators.', backMenu);
      }
      const admins = await api.getChatAdministrators({ chat_id: chatId });
      const list = admins.map((item) => {
        const user = item.user;
        return '• ' + escapeHtml(displayName(user)) +
          (user.username ? ' (@' + escapeHtml(user.username) + ')' : '');
      }).join('\n');
      return send(chatId, '<b>👮 Group administrators</b>\n\n' + (list || 'No administrators found.'), backMenu);
    }
  } catch (error) {
    console.error('Serena Group Manager menu callback failed:', action, error);
    return send(chatId,
      '⚠️ Could not complete that action.\n' +
      '<code>' + escapeHtml(error?.description || error?.message || 'Unknown error') + '</code>',
      backMenu);
  }
}

function send(chatId, text, keyboard) {
  return api.sendMessage({
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: keyboard,
    disable_web_page_preview: true,
  });
}