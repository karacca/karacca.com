import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori, { type Font } from "satori";
import sharp from "sharp";
import { iconSvg } from "@/lib/favicon";
import { domainOf } from "@/lib/format";
import { toDate, type ContributionDay } from "@/lib/github";
import { site } from "@/site.config";
import { chart } from "@/styles/tokens/chart";
import { og } from "@/styles/tokens/og";

export interface OgImage {
  title: string;
  description?: string;
  meta?: string[];
  icon?: string;
  chart?: ContributionDay[][];
}

type Style = Record<string, string | number>;

type Node =
  | {
      type: "div";
      props: {
        style: Style;
        children: Node[] | string;
      };
    }
  | {
      type: "img";
      props: {
        src: string;
        width: number;
        height: number;
        style?: Style;
      };
    };

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
let markCache: Promise<string> | undefined;

function dataUri(type: string, data: Buffer | string): string {
  return `data:${type};base64,${Buffer.from(data).toString("base64")}`;
}

function loadMark(): Promise<string> {
  markCache ??= iconSvg(og.scheme).then((svg) => dataUri("image/svg+xml", svg));
  return markCache;
}

async function loadIcon(file: string): Promise<string> {
  const size = og.icon.size * 2;
  const png = await sharp(file).resize(size, size).png().toBuffer();
  return dataUri("image/png", png);
}

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

function picture(
  src: string,
  width: number,
  height: number,
  style: Style = {},
): Node {
  return { type: "img", props: { src, width, height, style } };
}

function contributions(weeks: ContributionDay[][], width: number): Node {
  const step = chart.cell + chart.gap;
  const viewWidth = weeks.length * step - chart.gap;
  const viewHeight = 7 * step - chart.gap;
  const cells = weeks.flatMap((week, index) =>
    week.map(
      (day) =>
        `<rect x="${index * step}" y="${toDate(day.date).getUTCDay() * step}" width="${chart.cell}" height="${chart.cell}" rx="${chart.radius}" fill="${og.color.chart[day.level] ?? ""}"/>`,
    ),
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewWidth} ${viewHeight}">${cells.join("")}</svg>`;
  return picture(
    dataUri("image/svg+xml", svg),
    width,
    Math.round((width * viewHeight) / viewWidth),
    { marginTop: og.space.chartBefore },
  );
}

function layout(
  { title, description, meta = [], chart: weeks }: OgImage,
  mark: string,
  icon: string | undefined,
): Node {
  const { color, family, measure, space } = og;
  const titleToken =
    title.length > og.titleLongFrom ? og.text.titleLong : og.text.title;

  const top = box({ justifyContent: "space-between", alignItems: "center" }, [
    box({ alignItems: "center", gap: space.markGap }, [
      picture(mark, og.mark.size, og.mark.size),
      text(site.name, family.sans, color.text, og.text.name),
    ]),
    text(domainOf(site.url), family.mono, color.textMuted, og.text.meta),
  ]);

  const bottom = box({ flexDirection: "column", gap: space.stack }, [
    ...(icon
      ? [
          picture(icon, og.icon.size, og.icon.size, {
            borderRadius: og.icon.radius,
            marginBottom: space.iconAfter,
          }),
        ]
      : []),
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
    ...(weeks && weeks.length > 0
      ? [contributions(weeks, og.size.width - space.padding * 2)]
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
  const [mark, icon] = await Promise.all([
    loadMark(),
    image.icon ? loadIcon(image.icon) : undefined,
  ]);
  const node = layout(image, mark, icon);
  const svg = await satori(node as Parameters<typeof satori>[0], {
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
