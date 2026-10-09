# Serena Group Manager

A practical Telegram group moderation bot for Telegram Serverless (tgcloud), built for easy setup from Android Termux.

## Features

- Friendly /start menu with styled inline buttons
- /help and /commands
- /id — chat and user IDs
- /admins — list current group admins
- /rules and admin-only /setrules
- Admin-only /welcome on|off
- Reply-based /ban, /unban, /kick, /mute, /unmute
- Reply-based /warn, /warnings, /clearwarns with persistent warning records
- /purge [1-100] to remove recent messages
- /pin and /unpin
- Clear error messages for missing admin rights and invalid command use
- Persistent group settings and warnings using the Serverless SQLite database

## Important Telegram setup

1. Create a bot with @BotFather and enable Telegram Serverless for it.
2. Add the bot to your group.
3. Promote it to administrator with the permissions it needs: delete messages, ban/restrict members, pin messages, and manage chat.
4. To receive ordinary group messages for welcome/settings behaviour, review BotFather's Group Privacy setting. Commands and reply-based moderation are the primary supported workflow.
5. Run the commands in [deployment termux.md](deployment%20termux.md).

## Command examples

Reply to a member's message, then send:
- `/warn Be respectful`
- `/mute 10` — mute for 10 minutes
- `/ban`
- `/kick`
- `/purge 10` — delete up to 10 recent messages before the command
- `/setrules Be respectful. No spam or scams.`

Only Telegram group administrators can use moderation/settings commands. This bot does not bypass Telegram permissions; the bot itself must have the relevant admin rights.

## Button colours

The inline menu uses Telegram's `style` values (`primary`, `success`, `danger`) where supported by Telegram clients. Button styling is controlled by Telegram and may appear differently on older clients.

## Project layout

- `tgcloud/handlers/message.js` — commands and moderation
- `tgcloud/handlers/callback_query.js` — menu button actions
- `tgcloud/schema.js` — persistent group settings and warning records
- `deployment termux.md` — install, update, deploy, and redeploy instructions

## Safety

Use this bot only in groups where you are authorized to moderate. Follow Telegram's rules and applicable law.