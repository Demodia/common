const LOG_COLOR = {
  SLATE: '#64748b',
  GRAY: '#6b7280',
  ZINC: '#71717a',
  NEUTRAL: '#737373',
  STONE: '#78716c',
  RED: '#ef4444',
  ORANGE: '#f97316',
  AMBER: '#f59e0b',
  YELLOW: '#eab308',
  LIME: '#84cc16',
  GREEN: '#22c55e',
  EMERALD: '#10b981',
  TEAL: '#14b8a6',
  CYAN: '#06b6d4',
  SKY: '#0ea5e9',
  BLUE: '#3b82f6',
  INDIGO: '#6366f1',
  VIOLET: '#8b5cf6',
  PURPLE: '#a855f7',
  FUSCHIA: '#d946ef',
  PINK: '#ec4899',
  ROSE: '#f43f5e',
};

/**
 * Logs messages to the console with color.
 *
 * @param {string[]} messages - The messages to log.
 * @param {string[]} colors - The colors to use for each message.
 * @param {boolean} [debug=false] - Whether to actually log the messages.
 */
export default function debugWithColor(messages, colors, debug = false) {
  if (!debug) return;

  if (!Array.isArray(messages) || !Array.isArray(colors)) {
    console.warn('debugWithColor: Both messages and colors must be arrays.');
    return;
  }

  if (messages.length !== colors.length) {
    console.warn('debugWithColor: Messages and colors must have the same length.');
    return;
  }

  const formattedMessages = messages
    .map((message, index) => {
      const color = LOG_COLOR[colors[index].toUpperCase()];
      if (!color) {
        console.warn(`debugWithColor: Invalid color "${colors[index]}".`);
        return message;
      }
      return `%c${message}`;
    })
    .join(' ');

  const formattedColors = colors.map(color => `color: ${LOG_COLOR[color.toUpperCase()] || ''}`);

  console.log(formattedMessages, ...formattedColors);
}
