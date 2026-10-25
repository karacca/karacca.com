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
- Site-wide values (name, menu labels, social links, Cal.com link) in one config file
- Content collections with typed schemas
- MDX for components like `<Chip>`
- Unfinished posts use `draft: true` and are never built
- English only, no i18n; a post may be in another language when its frontmatter sets `lang`

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
- No auto-advancing carousels, marquees, or anything that moves on its own; the project image slider moves only on swipe or click
- No scroll-jacking, smooth-scroll libraries, snap sections, or scroll-triggered reveals

## Motion

- One entrance animation: fade + small rise + slight un-blur, staggered
- Plays on the first screen, first visit only; later loads are static
- CSS only, off for `prefers-reduced-motion`, content visible without JS
- Otherwise motion only on hover/click of a specific element

## Navigation

- Name "Ömer Karaca" at the top links home; no home menu item
- Menu: about · writing · projects (bookmarks · desk join in v2)
- No contact menu item; book a call and social links live outside the menu (e.g. footer)
- External links (App Store, Google Play, websites, social, Cal.com, Markdown links) open in a new tab with `target="_blank" rel="noopener"`; internal links stay in the same tab

## Content

- Social links: X, LinkedIn, GitHub as plain text links
- No sound anywhere on the site
- Inline chips: icon + name pill in prose, gentle CSS hover, local SVG icons
- Chips link where useful (company → site, project → detail page); otherwise plain
- Handwritten signature as static SVG at the end of about/intro; follows light/dark
- No location or timezone label, no live clock
- Book a call: plain link to https://cal.com/omer/intro
- Notes / keyboard feature: not at launch

## Projects

- One plain list, no type labels or filters
- Short intro line: projects I worked on or contributed to
- Row shows one `year` (the year it finished, or launched if still running) + company/client
- Sort toggle on the projects page: by `impact` (1–10, default) or by year; CSS-only radio control, no JS
- Every project has a detail page
- Detail pages read like a use case: screenshots with explanations; images live beside the entry in `src/content/projects/<slug>/`
- Optional `icon` (square app icon or logo, `src` + optional `dark`) shown above the title on the detail page and as a small thumbnail in list rows
- Every detail page follows one structure, in this order:
  - Lede: two or three sentences, no heading, with context the `description` doesn't already give (who it's for, scale, why it exists); never repeat the description
  - `## What I did`: always present and always first; one sentence on when, where, role and team, then a few bold-labelled bullets of concrete work, ending with a result if there is one
  - `## The app` (or "The platform", "The library" when that fits): the version I worked on, with its screenshots
  - Optional single story section with its own title: the hardest problem, told at a high level
  - Optional `## Since then` (finished projects) or `## Where it stands` (still running): one to three lines
- Depth follows `impact`: 7–10 may use every section, 4–6 adds at most one optional section, 1–3 stays at lede, What I did and The app; a short page beats padding
- Keep pages short and product-level: no implementation details (no architecture, libraries, vendors, code snippets or security measures; naming the main platform once, like Flutter or Swift, is fine) and no "How it is built" section
- Never publish confidential information: no client names, funding, internal test results, internal metrics, roadmaps or project status that the product's own public pages or my public profiles don't already show
- Optional `role` (what I did, in title case like "Android Lead" or "Project and Mobile Lead") shown in the detail page's rail under the year and company
- Optional `highlights` (up to four `value` + `label`, like downloads, rating or crash-free rate) as a quiet row under the description on the detail page; numbers describe the product while `role` says what I did; left out when there's nothing strong
- Optional `gallery` (`src`, `alt`, optional `caption`) forms a manual slider at the top of the detail page (scroll-snap; native swipe on touch; with mouse or trackpad the strip never scrolls natively, so vertical page scrolling is never caught, and a small script handles buttons, arrow keys and horizontal swipes); inline Markdown images in the body also work
- Platform icons (website / App Store / Google Play) always visible but faint, brighter on hover
- Projects that aren't live get a faint archive icon instead of platform icons, with the `status` (default "not live") as its tooltip in list rows and as its label on the detail page
- Stretched-link pattern: row opens detail page, icons link out directly
- Projects that must not go public use `published: false`: shown in `pnpm dev` only, never built (no list row, page or OG image), and chips to them render unlinked

## Writing, bookmarks, desk

- Posts are plain `.md`/`.mdx` files in the repo; no CMS UI
- RSS: blog posts only, full content
- Sitemap and generated OG images at build time
- Bookmarks: hand-written in the repo, dated list with title, short description, domain
- Desk: apps and dotfiles written as Markdown in this repo
- Bookmarks and desk are off for v1 and ship in v2: routes parked as `src/pages/_bookmarks.astro` and `_desk.astro` (Astro skips `_` files), left out of the menu, OG images and `lighthouserc.json`; content and the bookmarks collection stay

## Hosting

- Public GitHub repo
- Cloudflare Workers static assets; auto-deploy on push to `master`, preview deploys for branches
- No GitHub Actions workflows
- Fully static, no backend
- Cloudflare Web Analytics (cookieless, no consent banner)
- Commit directly to `master` with conventional commits (`feat:`, `fix:`, `content:`, `style:`, `chore:`)

## Open

- Where social links go (header, footer, intro)
- Final font
- Whether light mode is tinted too (decide with the font)
- Assets needed: signature scan, social profile URLs
