import { palette, type Scheme } from "../../lib/palette";

function colors(scheme: Scheme) {
  return {
    tile: palette("--color-bg", scheme),
    text: palette("--color-text", scheme),
  };
}

export const favicon = {
  size: 32,
  radius: 7,
  fit: {
    width: 0.68,
    height: 0.6,
  },
  tracking: "-0.05em",
  precision: 2,
  font: {
    family: "Inter",
    weight: 700,
    file: "@fontsource/inter/files/inter-latin-700-normal.woff",
  },
  color: {
    light: colors("light"),
    dark: colors("dark"),
  },
  icoSizes: [16, 32, 48],
  touchSize: 180,
} as const;
