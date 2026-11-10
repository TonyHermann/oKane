export const es = {
  "nav.changeTheme": "Cambiar tema",
  "nav.home": "Inicio",
  "nav.admin": "Administrar",
  "nav.budget": "Presupuesto",
  "nav.settings": "Configuración",
  "settings.title": "Configuración",
  "settings.general": "General",
  "settings.ascii": "Panel ASCII",
  "settings.languageRegion": "Idioma y región",
  "settings.language": "Idioma",
  "settings.backHome": "← Volver al inicio",
  "settings.general.placeholder": "Configuración general - en construcción 🚧",
  "common.rowCount": "{count} filas",
} as const;

export type MessageKey = keyof typeof es;
