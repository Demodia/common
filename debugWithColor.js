const LOG_COLOR = {
  BLUE: '#22d3ee',
  GREEN: '#4ade80',
  PURPLE: '#a78bfa',
  RED: '#ef4444',
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

  const formattedMessages = messages.map((message, index) => {
    const color = LOG_COLOR[colors[index].toUpperCase()];
    if (!color) {
      console.warn(`debugWithColor: Invalid color "${colors[index]}".`);
      return message;
    }
    return `%c${message}`;
  }).join(' ');

  const formattedColors = colors.map(color => `color: ${LOG_COLOR[color.toUpperCase()] || ''}`);

  console.log(formattedMessages, ...formattedColors);
}
