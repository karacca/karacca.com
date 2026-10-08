import { fontProviders } from "astro/config";
import type { AstroUserConfig } from "astro";

const provider = fontProviders.fontsource();

export const fonts: NonNullable<AstroUserConfig["fonts"]> = [
  {
    provider,
    name: "Inter",
    cssVariable: "--font-sans",
    weights: [400, 600],
    styles: ["normal", "italic"],
    subsets: ["latin", "latin-ext"],
    fallbacks: ["system-ui", "sans-serif"],
  },
  {
    provider,
    name: "JetBrains Mono",
    cssVariable: "--font-mono",
    weights: [400],
    styles: ["normal"],
    subsets: ["latin", "latin-ext"],
    fallbacks: ["ui-monospace", "monospace"],
  },
];
