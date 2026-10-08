import { palette } from "../../lib/palette";

const scheme = "dark";

export const og = {
  size: {
    width: 1200,
    height: 630,
  },
  color: {
    bg: palette("--color-bg", scheme),
    text: palette("--color-text", scheme),
    textMuted: palette("--color-text-muted", scheme),
  },
  space: {
    padding: 80,
    stack: 20,
    metaGap: 28,
  },
  measure: {
    title: 960,
    description: 880,
  },
  family: {
    sans: "Inter, Inter Ext",
    mono: "JetBrains Mono, JetBrains Mono Ext",
  },
  text: {
    name: {
      size: 30,
      weight: 600,
      leading: 1.25,
      tracking: "-0.011em",
    },
    meta: {
      size: 24,
      weight: 400,
      leading: 1.25,
      tracking: "0em",
    },
    title: {
      size: 64,
      weight: 600,
      leading: 1.15,
      tracking: "-0.022em",
      maxLines: 3,
      balance: true,
    },
    titleLong: {
      size: 52,
      weight: 600,
      leading: 1.2,
      tracking: "-0.02em",
      maxLines: 3,
      balance: false,
    },
    description: {
      size: 32,
      weight: 400,
      leading: 1.4,
      tracking: "-0.011em",
      maxLines: 2,
    },
  },
  titleLongFrom: 64,
  fonts: [
    {
      family: "Inter",
      weight: 400,
      subset: "latin",
      file: "@fontsource/inter/files/inter-latin-400-normal.woff",
      ranges: "@fontsource/inter/unicode.json",
    },
    {
      family: "Inter Ext",
      weight: 400,
      subset: "latin-ext",
      file: "@fontsource/inter/files/inter-latin-ext-400-normal.woff",
      ranges: "@fontsource/inter/unicode.json",
    },
    {
      family: "Inter",
      weight: 600,
      subset: "latin",
      file: "@fontsource/inter/files/inter-latin-600-normal.woff",
      ranges: "@fontsource/inter/unicode.json",
    },
    {
      family: "Inter Ext",
      weight: 600,
      subset: "latin-ext",
      file: "@fontsource/inter/files/inter-latin-ext-600-normal.woff",
      ranges: "@fontsource/inter/unicode.json",
    },
    {
      family: "JetBrains Mono",
      weight: 400,
      subset: "latin",
      file: "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff",
      ranges: "@fontsource/jetbrains-mono/unicode.json",
    },
    {
      family: "JetBrains Mono Ext",
      weight: 400,
      subset: "latin-ext",
      file: "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-ext-400-normal.woff",
      ranges: "@fontsource/jetbrains-mono/unicode.json",
    },
  ],
} as const;
