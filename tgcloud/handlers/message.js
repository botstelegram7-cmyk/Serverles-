// tgcloud/handlers/message.js — Handles every incoming non-service message.
//
// Responsibilities:
//   1. On /start — register or touch the user in the DB, send welcome + main menu.
//   2. On /help, /stats, /about — route to the matching response.
//   3. On any other text — echo it back and increment the message counter.

import { api, db } from 'sdk';
import { eq, sql } from 'sdk/db';

import { users } from '../schema.js';
import {
  welcomeMessage,
  HELP_TEXT,
  ABOUT_TEXT,
  statsMessage,
  VERSION_TEXT,
  ECHO_PREFIX,
  escapeHtml,
} from '../lib/text.js';
import { mainMenu, backMenu } from '../lib/keyboards.js';

const COMMANDS = {
  start: handleStart,
  help:  sendSimple(HELP_TEXT, backMenu),
  about: sendSimple(ABOUT_TEXT, backMenu),
  stats: handleStats,
  version: sendSimple(VERSION_TEXT, backMenu),
};

export default async function (message, _ctx) {
  if (message.chat.type !== 'private') return;
  if (!message.from) return;

  const chatId  = message.chat.id;
  const from    = message.from;
  const text    = (message.text ?? '').trim();
  const isStart = isCommand(text, 'start');

  // Keep command replies working even if a database write fails.
  try {
    // New users start with zero counted messages; /start preserves existing counts.
    await db.insert(users)
      .values({
        tgId:       from.id,
        firstName:  from.first_name ?? null,
        lastName:   from.last_name ?? null,
        username:   from.username ?? null,
        language:   from.language_code ?? null,
        lastSeenAt: new Date(),
        messages:   isStart ? 0 : 1,
      })
      .onConflictDoUpdate({
        target: users.tgId,
        set: {
          firstName:  from.first_name ?? null,
          lastName:   from.last_name ?? null,
          username:   from.username ?? null,
          language:   from.language_code ?? null,
          lastSeenAt: new Date(),
          messages:   isStart ? sql`${users.messages}` : sql`${users.messages} + 1`,
        },
      })
      .run();
  } catch (err) {
    console.error('user tracking failed', err);
  }

  if (text.startsWith('/')) {
    // Also accepts /start@BotName and commands with arguments.
    const cmd = text.slice(1).split(/\s|@/)[0].toLowerCase();
    const handler = COMMANDS[cmd];
    if (handler) return handler(chatId, from, message);
    return api.sendMessage({
      chat_id: chatId,
      text: "🤔 I don't know that command. Try /help to see what I understand.",
      reply_markup: backMenu,
      parse_mode: 'HTML',
    });
  }

  return api.sendMessage({
    chat_id: chatId,
    text: `${ECHO_PREFIX} <i>${escapeHtml(message.text ?? '(no text)')}</i>`,
    parse_mode: 'HTML',
  });
}

async function handleStart(chatId, from) {
  return api.sendMessage({
    chat_id: chatId,
    text: welcomeMessage(from),
    parse_mode: 'HTML',
    reply_markup: mainMenu,
    disable_web_page_preview: true,
  });
}

async function handleStats(chatId, from) {
  const row = await db.select({ messages: users.messages })
    .from(users)
    .where(eq(users.tgId, from.id))
    .get();
  const count = row?.messages ?? 0;
  return api.sendMessage({
    chat_id: chatId,
    text: statsMessage(from, count),
    parse_mode: 'HTML',
    reply_markup: backMenu,
  });
}

function sendSimple(text, reply_markup) {
  return (chatId) => api.sendMessage({
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup,
    disable_web_page_preview: true,
  });
}

function isCommand(text, name) {
  if (!text.startsWith('/')) return false;
  const cmd = text.slice(1).split(/\s|@/)[0].toLowerCase();
  return cmd === name;
}
