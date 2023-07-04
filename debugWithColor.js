const LOG_COLOR = {
  DARK: {
    SLATE: '#94a3b8',
    GRAY: '#9ca3af',
    ZINC: '#a1a1aa',
    NEUTRAL: '#a3a3a3',
    STONE: '#a8a29e',
    RED: '#f87171',
    ORANGE: '#fb923c',
    AMBER: '#fbbf24',
    YELLOW: '#facc15',
    LIME: '#a3e635',
    GREEN: '#4ade80',
    EMERALD: '#34d399',
    TEAL: '#2dd4bf',
    CYAN: '#22d3ee',
    SKY: '#38bdf8',
    BLUE: '#60a5fa',
    INDIGO: '#818cf8',
    VIOLET: '#a78bfa',
    PURPLE: '#c084fc',
    FUSCHIA: '#e879f9',
    PINK: '#f472b6',
    ROSE: '#fb7185',
  },
  LIGHT: {
    SLATE: '#475569',
    GRAY: '#4b5563',
    ZINC: '#52525b',
    NEUTRAL: '#525252',
    STONE: '#57534e',
    RED: '#dc2626',
    ORANGE: '#ea580c',
    AMBER: '#d97706',
    YELLOW: '#ca8a04',
    LIME: '#65a30d',
    GREEN: '#16a34a',
    EMERALD: '#059669',
    TEAL: '#0d9488',
    CYAN: '#0891b2',
    SKY: '#0284c7',
    BLUE: '#2563eb',
    INDIGO: '#4f46e5',
    VIOLET: '#7c3aed',
    PURPLE: '#9333ea',
    FUSCHIA: '#c026d3',
    PINK: '#db2777',
    ROSE: '#e11d48',
  },
};

/**
 * Logs messages to the console with color.
 *
 * @param {string[]} messages - The messages to log.
 * @param {string[]} colors - The colors to use for each message.
 * @param {boolean} [debug=false] - Whether to actually log the messages.
 * @param {string} [theme='LIGHT'] - The color theme to use.
 */
export default function debugWithColor(messages, colors, debug = false, theme = 'LIGHT') {
  if (!debug) return;

  if (!Array.isArray(messages) || !Array.isArray(colors)) {
    console.warn('debugWithColor: Both messages and colors must be arrays.');
    return;
  }

  if (messages.length !== colors.length) {
    console.warn('debugWithColor: Messages and colors must have the same length.');
    return;
  }

  const colorTheme = LOG_COLOR[theme.toUpperCase()];
  if (!colorTheme) {
    console.warn(`debugWithColor: Invalid theme "${theme}".`);
    return;
  }

  const formattedMessages = messages.map((message, index) => {
    const color = colorTheme[colors[index].toUpperCase()];
    if (!color) {
      console.warn(`debugWithColor: Invalid color "${colors[index]}".`);
      return message;
    }
    return `%c${message}`;
  }).join(' ');

  const formattedColors = colors.map(color => `color: ${colorTheme[color.toUpperCase()] || ''}`);

  console.log(formattedMessages, ...formattedColors);
}
