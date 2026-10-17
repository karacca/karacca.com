import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { FontProvider } from "astro";
import { fontProviders } from "astro/config";
import subsetFont from "subset-font";

export interface DerivedSubset {
  from: string;
  unicodeRange: [string, ...string[]];
}

type Face = NonNullable<
  Awaited<ReturnType<FontProvider["resolveFont"]>>
>["fonts"][number];

type Source = Extract<Face["src"][number], { url: string }>;

type Range = [start: number, end: number];

function parseRange(range: string): Range {
  const [start = "", end = start] = range.replace("U+", "").split("-");
  return [Number.parseInt(start, 16), Number.parseInt(end, 16)];
}

function formatRange([start, end]: Range): string {
  const hex = (point: number) =>
    point.toString(16).toUpperCase().padStart(4, "0");
  return start === end ? `U+${hex(start)}` : `U+${hex(start)}-${hex(end)}`;
}

function subtract(ranges: Range[], removed: Range[]): Range[] {
  return removed.reduce(
    (rest, [cutStart, cutEnd]) =>
      rest.flatMap(([start, end]) => {
        if (cutEnd < start || cutStart > end) {
          return [[start, end]];
        }
        const kept: Range[] = [];
        if (start < cutStart) {
          kept.push([start, cutStart - 1]);
        }
        if (cutEnd < end) {
          kept.push([cutEnd + 1, end]);
        }
        return kept;
      }),
    ranges,
  );
}

function characters(ranges: Range[]): string {
  return ranges
    .flatMap(([start, end]) =>
      Array.from({ length: end - start + 1 }, (_, index) =>
        String.fromCodePoint(start + index),
      ),
    )
    .join("");
}

export function fontsource(
  subsets: Record<string, DerivedSubset>,
): FontProvider {
  const provider = fontProviders.fontsource();
  let cache: URL | undefined;

  async function derive(
    face: Face,
    name: string,
    ranges: Range[],
  ): Promise<Face[]> {
    const source = face.src.find((item): item is Source => "url" in item);
    if (!source || !cache || ranges.length === 0) {
      return [];
    }
    const text = characters(ranges);
    const key = createHash("sha256")
      .update(source.url)
      .update(text)
      .digest("hex")
      .slice(0, 16);
    const path = fileURLToPath(new URL(`${key}.woff2`, cache));

    if (!existsSync(path)) {
      const response = await fetch(source.url);
      if (!response.ok) {
        throw new Error(
          `Could not download ${source.url} to build the "${name}" subset (status ${response.status})`,
        );
      }
      const font = await subsetFont(
        Buffer.from(await response.arrayBuffer()),
        text,
        { targetFormat: "woff2" },
      );
      await mkdir(cache, { recursive: true });
      await writeFile(path, font);
    }

    return [
      {
        ...face,
        src: [{ url: path, format: "woff2" }],
        unicodeRange: ranges.map(formatRange),
        meta: { ...face.meta, subset: name },
      },
    ];
  }

  return {
    name: `${provider.name}-subsets`,
    config: { subsets },
    async init(context) {
      cache = new URL("node_modules/.astro/font-subsets/", context.root);
      await provider.init?.(context);
    },
    async resolveFont(options) {
      const result = await provider.resolveFont({
        ...options,
        subsets: [
          ...new Set(
            options.subsets.map((name) => subsets[name]?.from ?? name),
          ),
        ],
      });
      if (!result) {
        return result;
      }

      const coverage = new Map(
        options.subsets.map((name) => [
          name,
          (
            subsets[name]?.unicodeRange ??
            result.fonts.find((face) => face.meta?.subset === name)
              ?.unicodeRange ??
            []
          ).map(parseRange),
        ]),
      );
      const derivedFrom = (name: string) =>
        options.subsets.filter((item) => subsets[item]?.from === name);
      const claimed = new Map(
        options.subsets.map((name, index) => {
          const source = subsets[name]?.from;
          const others = [
            ...options.subsets
              .slice(0, index)
              .filter((item) => item !== source),
            ...derivedFrom(name),
          ];
          return [
            name,
            subtract(
              coverage.get(name) ?? [],
              others.flatMap((item) => coverage.get(item) ?? []),
            ),
          ];
        }),
      );

      const fonts = await Promise.all(
        result.fonts.map(async (face) => {
          const name = face.meta?.subset;
          if (name === undefined || !face.unicodeRange) {
            return [face];
          }
          const own = claimed.get(name) ?? [];
          const built = await Promise.all(
            derivedFrom(name).map((item) =>
              derive(face, item, claimed.get(item) ?? []),
            ),
          );
          return [
            ...(own.length > 0
              ? [{ ...face, unicodeRange: own.map(formatRange) }]
              : []),
            ...built.flat(),
          ];
        }),
      );
      return { fonts: fonts.flat() };
    },
    listFonts: () => provider.listFonts?.(),
  };
}
