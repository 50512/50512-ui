const DOT_COLORS = {
  green: "green-dot",
  orange: "orange-dot",
  red: "red-dot",
} as const;

export const STATUS_BAR_CONFIG = {
  operational: {
    dot_color: DOT_COLORS.green,
    status_text: "OPERATIVO",
  },
  trial: {
    dot_color: DOT_COLORS.orange,
    status_text: "EN PROGRESO",
  },
  offline: {
    dot_color: DOT_COLORS.red,
    status_text: "NO DISPONIBLE",
  },
} as const;

export type StatusBarType = keyof typeof STATUS_BAR_CONFIG;
