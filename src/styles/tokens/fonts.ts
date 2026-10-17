import type { AstroUserConfig } from "astro";
import { fontsource } from "../../lib/fontsource";

const provider = fontsource({
  turkish: {
    from: "latin-ext",
    unicodeRange: ["U+011E-011F", "U+0130", "U+015E-015F"],
  },
});

export const fonts: NonNullable<AstroUserConfig["fonts"]> = [
  {
    provider,
    name: "Inter",
    cssVariable: "--font-sans",
    weights: [400, 600],
    styles: ["normal", "italic"],
    subsets: ["latin", "turkish", "latin-ext"],
    fallbacks: ["system-ui", "sans-serif"],
  },
  {
    provider,
    name: "JetBrains Mono",
    cssVariable: "--font-mono",
    weights: [400],
    styles: ["normal"],
    subsets: ["latin", "turkish", "latin-ext"],
    fallbacks: ["ui-monospace", "monospace"],
  },
];
