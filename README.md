# karacca.com

Personal site of Ömer Karaca. A fully static [Astro](https://astro.build) site: plain CSS, Markdown content, near-zero JavaScript, deployed to Cloudflare Workers static assets.

## Requirements

- Node 24 (see `.nvmrc`). Node 22.12 is the oldest version that works.
- pnpm (the version pinned in `packageManager` in `package.json`)

## Commands

| Command             | What it does                                           |
| ------------------- | ------------------------------------------------------ |
| `pnpm install`      | Install dependencies                                   |
| `pnpm dev`          | Dev server at `http://localhost:4321`, drafts included |
| `pnpm build`        | Production build into `dist/`                          |
| `pnpm preview`      | Serve `dist/` with Astro's preview server              |
| `pnpm check`        | Type check (`astro check`)                             |
| `pnpm lint`         | ESLint                                                 |
| `pnpm format`       | Prettier, write                                        |
| `pnpm format:check` | Prettier, check only                                   |
| `pnpm lighthouse`   | Lighthouse against `dist/` (run `pnpm build` first)    |

## Where things live

```text
src/
  site.config.ts      site-wide values
  content.config.ts   content collection schemas
  content/
    pages/            single pages (home, about, desk, ...) and their labels
    posts/            blog posts (.md / .mdx)
    projects/         projects (.md / .mdx)
    bookmarks.yaml    bookmarks
  styles/tokens/      design tokens
  icons/              local SVG icons used by chips and links
  components/         Astro components
  layouts/            page shell
  lib/                content, formatting and build-time helpers
  pages/              routes
public/               files copied as-is (_headers)
```

### Content

All copy lives in `src/content/`. Components and `.astro` pages contain no text.

- **Pages**: one file per page in `src/content/pages/`. Frontmatter holds `title`, `description`, an optional `heading`, and a `labels` map for every small string that page needs.
- **Posts**: `src/content/posts/<slug>.md` with `title`, `description`, `date`, optional `updated` and `lang`. The file name is the URL: `/writing/<slug>`. Set `lang` (for example `tr`) on a post that is not in English; it marks the post's title and text with that language. Images and videos for a post go in a folder named after the post, next to it.
- **Projects**: `src/content/projects/<slug>.md` with `title`, `description`, `year`, optional `company`, `role`, `links` (`website`, `appStore`, `googlePlay`, `github`), `status`, `impact`, `icon`, `highlights`, `gallery`, `screens` and `published`. Every project gets its own page at `/projects/<slug>`.
- **Bookmarks**: entries in `src/content/bookmarks.yaml` with `title`, `url`, `date`, optional `description`.

Bookmarks and desk are not built in v1. Their routes are parked as `src/pages/_bookmarks.astro` and `src/pages/_desk.astro`, which Astro skips. To turn them on, drop the `_` prefix, add them back to `menu` in `src/site.config.ts`, remove them from `excludedPages` in `src/pages/og/[...slug].png.ts`, and add their URLs to `lighthouserc.json`.

The schemas in `src/content.config.ts` are strict. A key that is not in the schema (a typo such as `drfat`), a missing required key, or a date that is not written as `YYYY-MM-DD` fails the build and names the entry.

MDX files can use `<Chip icon="name" href="https://...">Label</Chip>`. Icons are SVG files in `src/icons/`, named after the `icon` value.

Markdown links to `.xml` and `.pdf` files get `data-astro-prefetch="false"` at build time, so hovering them does not download the file. This is done by a small Markdown plugin in `astro.config.ts`.

### Drafts

Add `draft: true` to a post's frontmatter. Drafts show up in `pnpm dev` only. Every `astro build` leaves them out entirely, whatever `NODE_ENV` is set to: no page, no sitemap entry, no OG image. The RSS feed never includes drafts, in dev or in a build.

Projects work the same way with `published: false`: the project shows up in `pnpm dev` only, and a build leaves out its list row, page, sitemap entry and OG image. A `<Chip project="...">` pointing at it still renders, without a link. The entry and its images stay in the repo, so anything that must stay private has to be removed, not just unpublished.

### Site config

`src/site.config.ts` holds everything that is not page content: site URL and name, the monogram drawn as the favicon, menu, social links, book-a-call link, and shared labels.

### Design tokens

Every visual value is a CSS custom property in `src/styles/tokens/`:

- `color.css`, `typography.css`, `spacing.css`, `layout.css`, `motion.css`
- Each file has two layers: primitives first, then semantic tokens (`--color-text`, `--space-m`). Components only use the semantic layer.
- `og.ts` holds the same kind of values for the generated Open Graph images.
- `favicon.ts` holds the font, letter spacing, fit and corner radius of the favicon. `favicon.svg` (light and dark), `favicon.ico` and `apple-touch-icon.png` are drawn from the monogram in `src/site.config.ts` at build time, and the same icon sits next to the name on the Open Graph images.
- `code.ts` names the two Shiki themes for code blocks, plus the code block surface colors and the minimum contrast that token colors are adjusted to at build time.

`color.css` is the only place colors are defined. `og.ts`, `favicon.ts` and `code.ts` do not contain hex values: they ask `src/lib/palette.ts` for a token such as `--color-surface` in the light or dark scheme. That helper reads `color.css` at build time, follows `var()` and `light-dark()` to the `oklch()` primitive, converts it to sRGB hex, and fails the build if a token cannot be resolved. A change to the palette therefore reaches the OG images, the favicons and the code contrast check on the next build. In `pnpm dev`, restart the server after a palette change to see it in those places.

### Fonts

Fonts are self-hosted through Astro's fonts API and Fontsource. `fontsource()` in `src/lib/fontsource.ts` wraps Astro's Fontsource provider so a family can also use small subsets cut at build time (see 4).

1. In `src/styles/tokens/fonts.ts`, change `name` to any family available on Fontsource. Keep `cssVariable` (`--font-sans`, `--font-mono`) so the tokens in `typography.css` keep working. Adjust `weights`, `styles` and `subsets` to what the family offers.
2. List weights one by one (`[400, 500, 600]`), not as a range (`"400 600"`). Single weights ship small static files, about 21 to 25 KB each for the latin subset. A range ships the variable font, which is three to five times larger per file. Only list weights the CSS uses.
3. The preloaded faces are chosen by the `preload` option on the two `<Font>` tags in `src/layouts/Base.astro`. Three faces are preloaded because every page uses them: sans 400 (body), sans 600 (the name in the header) and mono 400 (footer and meta text), latin subset, normal style. Everything else (italic, `turkish`, latin-ext) is downloaded only by pages that use it. If a weight stops being used on every page, remove it from the preload list.
4. Turkish needs five letters that are not in Fontsource's latin subset: Ğ ğ İ Ş ş (ı is in latin). They live in latin-ext, which is about 35 KB per face, so a Turkish post would download a latin-ext file for every weight and style it uses. Instead, the `turkish` subset defined at the top of `fonts.ts` is cut from each face's latin-ext file at build time with `subset-font`, which gives one woff2 of about 1.5 KB per face, cached in `node_modules/.astro/font-subsets/`. A character that more than one listed subset covers is served only by the first of them, and a cut subset always wins over the subset it comes from. So latin-ext no longer claims ı or the Turkish letters, and the latin-ext file is only downloaded for other letters (ł or č, for example). This works for any Fontsource family that has a latin-ext subset. To cover another language the same way, add an entry with `from` and `unicodeRange` and list its name in `subsets`.
5. OG images read font files from `node_modules/@fontsource/<family>/files/`. If the sans or mono family changes, add the matching `@fontsource/<family>` package and update `fonts` and `family` in `src/styles/tokens/og.ts`. Each entry there also names its `subset` and the package's `unicode.json`. The build checks every OG title, description and meta line against those ranges and fails, naming the entry and the character, if one is not covered (an arrow or an emoji, for example). Reword the text or add a font that covers the character.

## Deploy

The site is served by Cloudflare Workers static assets. There is no Worker script; `wrangler.jsonc` only points at `dist/`.

- `html_handling: "drop-trailing-slash"` serves `dist/about.html` at `/about` and redirects `/about/` to `/about`.
- `not_found_handling: "404-page"` serves `dist/404.html` with a 404 status.
- `public/_headers` is copied to `dist/_headers` and sets caching and security headers. Files under `/_astro/` (fonts, scripts, icons) have hashed names and are cached for a year as immutable. Everything else (HTML, OG images, the feed) is cached for 60 seconds, which is what lets a hover-prefetched page open without a second request. The cost is that a visitor can see a page up to 60 seconds old after a deploy. It also marks `*.workers.dev` URLs as `noindex` so only the real domain is indexed.
- `robots.txt` is generated by `src/pages/robots.txt.ts` so the sitemap URL follows `url` in `src/site.config.ts`.

### One-time setup (Workers Builds)

1. Cloudflare dashboard → Workers & Pages → Create → Import a repository, and pick this GitHub repo.
2. Name the Worker `karacca-com`. It has to match `name` in `wrangler.jsonc`.
3. Build settings:
   - Build command: `pnpm build`
   - Deploy command: `npx wrangler deploy`
   - Non-production branch deploy command: `npx wrangler versions upload`
   - Root directory: `/`
   - Production branch: `master`
4. Enable builds for non-production branches. Every pushed branch then gets a preview URL on `workers.dev`.
5. Build variables: the Node version is read from `.nvmrc`. If the build image picks a different pnpm than the one in `packageManager`, set `PNPM_VERSION` as a build variable.
6. Worker → Settings → Domains & Routes → add `karacca.com` as a custom domain.

After that, every push to `master` builds and deploys production. Wrangler is not a dependency of this repo; Cloudflare's build fetches it for the deploy step.

### Analytics

Cloudflare Web Analytics is cookieless and needs no consent banner. The `karacca.com` site uses automatic setup: Cloudflare adds the beacon script to HTML pages as it serves them, so the repo has no analytics code. Local builds and `workers.dev` preview URLs don't get the beacon, and `pnpm lighthouse` doesn't measure it.

Its settings are in the Cloudflare dashboard → Analytics & Logs → Web Analytics → `karacca.com` → Manage site. Don't also add the JavaScript snippet to the site, or every page view is counted twice.

## Checks

There is no CI. Before pushing, run:

1. `pnpm format:check`
2. `pnpm lint`
3. `pnpm check`
4. `pnpm build`
5. `pnpm lighthouse`

`pnpm lighthouse` uses the config in `lighthouserc.json`. It starts Astro's preview server on port 4322, audits the main routes, one post and one project detail page three times each, and fails unless performance, accessibility, best practices and SEO all score 100. The post URL in that file has to point at a post that exists and is not a draft, and the project URL (`/projects/moodstone`) at a project that is not `published: false`. Update both when those entries are renamed or removed. Reports are written to `.lighthouseci/`, which is git-ignored.

## Conventions

- Commit straight to `master` with conventional commits: `feat:`, `fix:`, `content:`, `style:`, `chore:`.
- Project rules for people and agents are in `AGENTS.md`.
