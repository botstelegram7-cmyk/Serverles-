// tgcloud/schema.js — Database schema.
// Tables are named exports. Deploying this file registers the schema; run
// `npx tgcloud migrate` after `push` to actually apply the changes.

import { table, integer, text, index, sql } from 'sdk/db';

// One row per Telegram user that has ever /start-ed the bot.
export const users = table(
  'users',
  {
    id:         integer('id').primaryKey({ autoIncrement: true }),
    tgId:       integer('tg_id').notNull().unique(),
    firstName:  text('first_name'),
    lastName:   text('last_name'),
    username:   text('username'),
    language:   text('language_code'),
    startedAt:  integer('started_at', { mode: 'timestamp' })
                  .default(sql`(unixepoch())`),
    lastSeenAt: integer('last_seen_at', { mode: 'timestamp' })
                  .default(sql`(unixepoch())`),
    messages:   integer('messages').notNull().default(0),
  },
  (t) => ({
    tgIdIdx: index('idx_users_tg_id').on(t.tgId),
  }),
);
