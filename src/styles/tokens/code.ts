import { palette } from "../../lib/palette";

export const code = {
  themes: {
    light: "vitesse-light",
    dark: "vitesse-dark",
  },
  surface: {
    light: palette("--color-surface", "light"),
    dark: palette("--color-surface", "dark"),
  },
  minContrast: 4.6,
} as const;
