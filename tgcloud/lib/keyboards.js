// tgcloud/lib/keyboards.js — Reusable inline keyboards.

/** Main menu shown under the welcome message. */
export const mainMenu = {
  inline_keyboard: [
    [
      { text: '📊 My stats',   callback_data: 'action:stats' },
      { text: '🛠 Help',       callback_data: 'action:help'  },
    ],
    [
      { text: '☁️ About Serverless', callback_data: 'action:about' },
    ],
  ],
};

/** A small "back" keyboard for sub-pages. */
export const backMenu = {
  inline_keyboard: [
    [
      { text: '⬅️ Back', callback_data: 'action:start' },
    ],
  ],
};
