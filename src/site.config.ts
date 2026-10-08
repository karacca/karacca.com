export const site = {
  url: "https://karacca.com",
  name: "Ömer Karaca",
  language: "en",
  dateLocale: "en-GB",
  monthLocale: "en-US",
  titleTemplate: "%s — Ömer Karaca",
  menu: [
    { label: "about", href: "/about" },
    { label: "writing", href: "/writing" },
    { label: "projects", href: "/projects" },
    { label: "bookmarks", href: "/bookmarks" },
    { label: "desk", href: "/desk" },
  ],
  social: [
    { label: "X", href: "https://x.com/karacca" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/karacca/" },
    { label: "GitHub", href: "https://github.com/karacca" },
  ],
  github: {
    username: "karacca",
  },
  bookCall: {
    label: "Book a call",
    href: "https://cal.com/omer/intro",
  },
  resume: {
    label: "Resume",
    href: "/resume.pdf",
    filename: "omer-karaca-resume.pdf",
  },
  rss: {
    label: "RSS",
    href: "/rss.xml",
  },
  timezone: {
    label: "Based in Istanbul, GMT+3",
  },
  analytics: {
    cloudflareToken: "",
  },
  labels: {
    skipToContent: "Skip to content",
    mainMenu: "Main",
    footerLinks: "Elsewhere",
    website: "Website",
    appStore: "App Store",
    googlePlay: "Google Play",
    notLive: "not live",
    platformLink: "{label}: {title}",
    metaSeparator: " · ",
    chartLess: "Less",
    chartMore: "More",
    updated: "Updated",
    backToWriting: "writing",
    backToProjects: "projects",
  },
} as const;
