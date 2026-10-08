# Agent Rules

## Code

- Do not add code comments
- Astro (latest) + TypeScript strict, static output
- pnpm, ESLint + Prettier with Astro plugins
- Plain CSS: Astro scoped styles + CSS custom properties, no Tailwind
- No UI framework; small vanilla TS scripts only where needed
- All visual values live in token files (`src/styles/tokens/`: color, typography, spacing, layout, motion)
- Tokens in two layers: primitives → semantic (`--color-text`, `--space-m`); components use semantic only
- Components never hard-code colors, sizes, fonts, or durations
- No copy in components or `.astro` pages; all text lives in `.md`/`.mdx` under `src/content/`
- Single pages (home, about, desk) are content entries; posts, projects, bookmarks are collections
- Site-wide values (name, menu labels, social links, Cal.com link, timezone) in one config file
- Content collections with typed schemas
- MDX for components like `<Chip>`
- Unfinished posts use `draft: true` and are never built
- English only, no i18n

## Performance

- Must be very fast; near-zero JS on content pages
- Lighthouse 100, checked locally with `pnpm lighthouse`
- Astro built-in prefetch for instant navigation
- No page-transition animations
- Shiki highlighting at build time with dual light/dark themes
- Self-hosted free fonts (Fontsource), subset, main face preloaded

## Design

- Calm, simple, only slightly distinct; character comes from type, layout, and background color
- Follow system light/dark only; no theme toggle
- Tinted, slightly unusual background (not pure white/black); strong text contrast
- Desktop layout 70–80% of viewport with a max width
- Long-form text capped at ~65–75 characters per line
- Mobile friendly
- Start with a neutral placeholder font; pick the final font by trying candidates on the built site
- Free / open-source fonts only
- No loud hero text
- No dock / tab-bar / icon navigation; plain text links with real URLs in the header
- No cursor-following effects, custom cursors, or mouse-reactive backgrounds
- No carousels, marquees, or anything that moves on its own
- No scroll-jacking, smooth-scroll libraries, snap sections, or scroll-triggered reveals

## Motion

- One entrance animation: fade + small rise + slight un-blur, staggered
- Plays on the first screen, first visit only; later loads are static
- CSS only, off for `prefers-reduced-motion`, content visible without JS
- Otherwise motion only on hover/click of a specific element

## Navigation

- Name "Ömer Karaca" at the top links home; no home menu item
- Menu: about · writing · projects · bookmarks · desk
- No contact menu item; book a call and social links live outside the menu (e.g. footer)

## Content

- Social links: X, LinkedIn, GitHub as plain text links
- Resume: native `download` link to the PDF, with a subtle Web Audio sound
- Sound is used only for the resume download, nowhere else
- GitHub contributions chart on the home page, rendered at build time, in site palette (no GitHub green), figure-style caption
- Inline chips: icon + name pill in prose, gentle CSS hover, local SVG icons
- Chips link where useful (company → site, project → detail page); otherwise plain
- Handwritten signature as static SVG at the end of about/intro; follows light/dark
- Timezone: static label like "Based in <city>, GMT+X"; no live clock
- Book a call: plain link to https://cal.com/omer/intro
- Notes / keyboard feature: not at launch

## Projects

- One plain list, no type labels or filters
- Short intro line: projects I worked on or contributed to, not all solely mine
- Row shows year + company/client
- Some projects have a detail page, some don't
- Platform icons (website / App Store / Google Play) always visible but faint, brighter on hover
- Projects that aren't live get a quiet label instead of icons
- Stretched-link pattern: row opens detail page, icons link out directly

## Writing, bookmarks, desk

- Posts are plain `.md`/`.mdx` files in the repo; no CMS UI
- RSS: blog posts only, full content
- Sitemap and generated OG images at build time
- Bookmarks: hand-written in the repo, dated list with title, short description, domain
- Desk: apps and dotfiles written as Markdown in this repo

## Hosting

- Public GitHub repo
- Cloudflare Workers static assets; auto-deploy on push to `main`, preview deploys for branches
- No GitHub Actions workflows; the GitHub chart refreshes on each deploy
- Fully static, no backend
- Cloudflare Web Analytics (cookieless, no consent banner)
- Commit directly to `main` with conventional commits (`feat:`, `fix:`, `content:`, `style:`, `chore:`)

## Open

- Where social links go (header, footer, intro)
- Final font
- Whether light mode is tinted too (decide with the font)
- Resume sound source and playback approach
- Assets needed: resume PDF, signature scan, city for timezone, social profile URLs
