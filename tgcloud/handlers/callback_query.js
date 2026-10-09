// tgcloud/handlers/callback_query.js — Handles inline-keyboard button presses.
// The data we encode is the simple form "action:<name>", e.g. "action:stats".

import { api } from 'sdk';
import { db } from 'sdk';
import { eq } from 'sdk/db';

import { users } from '../schema.js';
import {
  welcomeMessage,
  HELP_TEXT,
  ABOUT_TEXT,
  statsMessage,
  BUTTON_THANKS,
} from '../lib/text.js';
import { mainMenu, backMenu } from '../lib/keyboards.js';

const ACTIONS = {
  start: (chatId, from) => api.sendMessage({
    chat_id: chatId,
    text: welcomeMessage(from),
    parse_mode: 'HTML',
    reply_markup: mainMenu,
    disable_web_page_preview: true,
  }),
  help: (chatId) => api.sendMessage({
    chat_id: chatId,
    text: HELP_TEXT,
    parse_mode: 'HTML',
    reply_markup: backMenu,
    disable_web_page_preview: true,
  }),
  about: (chatId) => api.sendMessage({
    chat_id: chatId,
    text: ABOUT_TEXT,
    parse_mode: 'HTML',
    reply_markup: backMenu,
    disable_web_page_preview: true,
  }),
  stats: async (chatId) => {
    const row = await db.select({ messages: users.messages })
      .from(users)
      .where(eq(users.tgId, chatId))
      .get();
    return api.sendMessage({
      chat_id: chatId,
      text: statsMessage({ first_name: null }, row?.messages ?? 0),
      parse_mode: 'HTML',
      reply_markup: backMenu,
    });
  },
};

export default async function (cb, _ctx) {
  // Always acknowledge the callback so Telegram stops showing the spinner.
  try { await api.answerCallbackQuery({ callback_query_id: cb.id }); } catch (_) {}

  const data = cb.data ?? '';
  if (!data.startsWith('action:')) return;

  const action = data.slice('action:'.length);
  const handler = ACTIONS[action];
  if (!handler) return;

  const chatId = cb.message?.chat?.id;
  if (!chatId) return; // shouldn't happen for keyboard-originated callbacks

  try {
    await handler(chatId, cb.from);
  } catch (err) {
    // Best-effort: don't let a single failed action crash the callback.
    console.error('callback action failed', action, err);
    try {
      await api.sendMessage({
        chat_id: chatId,
        text: `⚠️ Something went wrong running <code>${action}</code>.`,
        parse_mode: 'HTML',
      });
    } catch (_) {}
  }
}
