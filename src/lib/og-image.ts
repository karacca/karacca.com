import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori, { type Font } from "satori";
import { domainOf } from "@/lib/format";
import { site } from "@/site.config";
import { og } from "@/styles/tokens/og";

export interface OgImage {
  title: string;
  description?: string;
  meta?: string[];
}

type Style = Record<string, string | number>;

interface Node {
  type: "div";
  props: {
    style: Style;
    children: Node[] | string;
  };
}

interface TextToken {
  size: number;
  weight: number;
  leading: number;
  tracking: string;
  maxLines?: number;
  balance?: boolean;
}

type Range = [start: number, end: number];

const wordGapPattern = /\s/;

let fontCache: Promise<Font[]> | undefined;
let coverageCache: Promise<Map<string, Range[]>> | undefined;

function loadFonts(): Promise<Font[]> {
  fontCache ??= Promise.all(
    og.fonts.map(async ({ family, weight, file }) => ({
      name: family,
      weight,
      style: "normal" as const,
      data: await readFile(resolve(process.cwd(), "node_modules", file)),
    })),
  );
  return fontCache;
}

function loadCoverage(): Promise<Map<string, Range[]>> {
  coverageCache ??= (async () => {
    const coverage = new Map<string, Range[]>();
    for (const { family, subset, ranges } of og.fonts) {
      const subsets = JSON.parse(
        await readFile(resolve(process.cwd(), "node_modules", ranges), "utf8"),
      ) as Record<string, string | undefined>;
      const list = subsets[subset];
      if (list === undefined) {
        throw new Error(`Missing subset "${subset}" in ${ranges}`);
      }
      coverage.set(family, [
        ...(coverage.get(family) ?? []),
        ...list.split(",").map((range): Range => {
          const [start = "", end = start] = range.replace("U+", "").split("-");
          return [Number.parseInt(start, 16), Number.parseInt(end, 16)];
        }),
      ]);
    }
    return coverage;
  })();
  return coverageCache;
}

async function assertCovered(
  { title, description, meta = [] }: OgImage,
  entry: string,
): Promise<void> {
  const coverage = await loadCoverage();
  const fields = [
    { name: "title", content: title, family: og.family.sans },
    { name: "description", content: description ?? "", family: og.family.sans },
    ...meta.map((content) => ({
      name: "meta",
      content,
      family: og.family.mono,
    })),
  ];

  for (const { name, content, family } of fields) {
    const ranges = family
      .split(",")
      .flatMap((item) => coverage.get(item.trim()) ?? []);
    for (const character of content) {
      const point = character.codePointAt(0) ?? 0;
      if (!ranges.some(([start, end]) => point >= start && point <= end)) {
        const code = point.toString(16).toUpperCase().padStart(4, "0");
        throw new Error(
          `OG image for "${entry}": the ${name} contains "${character}" (U+${code}), which the fonts listed in src/styles/tokens/og.ts (${family}) do not cover`,
        );
      }
    }
  }
}

function box(style: Style, children: Node[]): Node {
  return {
    type: "div",
    props: { style: { display: "flex", ...style }, children },
  };
}

function text(
  content: string,
  family: string,
  color: string,
  token: TextToken,
  style: Style = {},
): Node {
  return {
    type: "div",
    props: {
      style: {
        display: "block",
        fontFamily: family,
        fontSize: token.size,
        fontWeight: token.weight,
        lineHeight: token.leading,
        letterSpacing: token.tracking,
        wordBreak: "break-word",
        color,
        ...(token.maxLines ? { lineClamp: token.maxLines } : {}),
        ...(token.balance && wordGapPattern.test(content.trim())
          ? { textWrap: "balance" }
          : {}),
        ...style,
      },
      children: content,
    },
  };
}

function layout({ title, description, meta = [] }: OgImage): Node {
  const { color, family, measure, space } = og;
  const titleToken =
    title.length > og.titleLongFrom ? og.text.titleLong : og.text.title;

  const top = box({ justifyContent: "space-between", alignItems: "center" }, [
    text(site.name, family.sans, color.text, og.text.name),
    text(domainOf(site.url), family.mono, color.textMuted, og.text.meta),
  ]);

  const bottom = box({ flexDirection: "column", gap: space.stack }, [
    ...(meta.length > 0
      ? [
          box(
            { gap: space.metaGap },
            meta.map((item) =>
              text(item, family.mono, color.textMuted, og.text.meta),
            ),
          ),
        ]
      : []),
    text(title, family.sans, color.text, titleToken, {
      maxWidth: measure.title,
    }),
    ...(description
      ? [
          text(description, family.sans, color.textMuted, og.text.description, {
            maxWidth: measure.description,
          }),
        ]
      : []),
  ]);

  return box(
    {
      width: "100%",
      height: "100%",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: space.padding,
      backgroundColor: color.bg,
    },
    [top, bottom],
  );
}

export async function renderOgImage(
  image: OgImage,
  entry: string,
): Promise<Uint8Array<ArrayBuffer>> {
  await assertCovered(image, entry);
  const svg = await satori(layout(image) as Parameters<typeof satori>[0], {
    width: og.size.width,
    height: og.size.height,
    fonts: await loadFonts(),
  });
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: og.size.width },
  })
    .render()
    .asPng();
  return new Uint8Array(png);
}
