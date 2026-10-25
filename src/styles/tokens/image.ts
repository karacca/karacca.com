export const image = {
  webp: {
    quality: 90,
    smartSubsample: true,
  },
  cover: {
    widths: [640, 800, 960, 1280, 1600, 1920, 2400],
    sizes: "(min-width: 52rem) min(60vw + 3rem, 86rem), calc(100vw - 2.5rem)",
  },
  gallery: {
    quality: 80,
  },
  screen: {
    widths: [240, 320, 480, 640, 800, 960],
    height: 32,
    wideHeight: 40,
    wideMedia: "(min-width: 90rem)",
    eager: 1,
    quality: 80,
  },
  thumb: {
    widths: [48, 96, 144, 192],
    sizes: "(min-width: 90rem) 3.75rem, 3rem",
  },
  icon: {
    widths: [64, 128, 192, 256],
    sizes: "(min-width: 90rem) 5rem, 4rem",
  },
  chip: {
    widths: [16, 32, 48],
    sizes: "1rem",
  },
} as const;
