import { table, integer, text, boolean, index, sql } from 'sdk/db';

export const groupSettings = table(
  'sgm_group_settings',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chatId: integer('chat_id').notNull().unique(),
    rules: text('rules').default('No rules have been set yet. An administrator can use /setrules to add them.'),
    welcome: boolean('welcome').notNull().default(true),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (t) => ({
    chatIdIdx: index('idx_sgm_group_settings_chat_id').on(t.chatId),
  }),
);

export const warnings = table(
  'sgm_warnings',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chatId: integer('chat_id').notNull(),
    userId: integer('user_id').notNull(),
    adminId: integer('admin_id').notNull(),
    reason: text('reason').notNull().default('No reason provided'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (t) => ({
    chatUserIdx: index('idx_sgm_warnings_chat_user').on(t.chatId, t.userId),
  }),
);