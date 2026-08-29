const DOT_COLORS = {
  green: "green-dot",
  orange: "orange-dot",
  red: "red-dot",
} as const;

export const STATUS_COMPONENTS_CONFIG = {
  operative: {
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
  400: {
    dot_color: DOT_COLORS.orange,
    status_text: "MALA PETICIÓN",
  },
  403: {
    dot_color: DOT_COLORS.orange,
    status_text: "NO AUTORIZADO",
  },
  404: {
    dot_color: DOT_COLORS.orange,
    status_text: "NO ENCONTRADO",
  },
  405: {
    dot_color: DOT_COLORS.orange,
    status_text: "MÉTODO NO PERMITIDO",
  },
  418: {
    dot_color: DOT_COLORS.red,
    status_text: "SOY UNA TETERA",
  },
  429: {
    dot_color: DOT_COLORS.orange,
    status_text: "DEMASIADAS PETICIONES",
  },
  500: {
    dot_color: DOT_COLORS.red,
    status_text: "ERROR INTERNO DEL SERVIDOR",
  },
  502: {
    dot_color: DOT_COLORS.red,
    status_text: "ERROR DEL SERVICIO",
  },
  509: {
    dot_color: DOT_COLORS.red,
    status_text: "ANCHO DE BANDA EXCEDIDO",
  },
} as const;

export type StatusKeysType = keyof typeof STATUS_COMPONENTS_CONFIG;
