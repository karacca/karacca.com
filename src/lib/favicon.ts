import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import type { Scheme } from "@/lib/palette";
import { site } from "@/site.config";
import { favicon } from "@/styles/tokens/favicon";

const sample = 400;
const pathPattern = /<path[^>]*\sd="([^"]+)"/g;
const commandPattern = /([MLQCZ])([^MLQCZ]*)/g;
const numberPattern = /-?(?:\d+\.?\d*|\.\d+)/g;

let outlineCache: Promise<string> | undefined;

function round(value: number): number {
  return Number(value.toFixed(favicon.precision));
}

async function renderOutline(): Promise<string> {
  const { family, weight, file } = favicon.font;
  const text = site.monogram;
  const width = sample * [...text].length * 2;
  const height = sample * 2;
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          fontFamily: family,
          fontWeight: weight,
          fontSize: sample,
          lineHeight: 2,
          letterSpacing: favicon.tracking,
        },
        children: text,
      },
    },
    {
      width,
      height,
      fonts: [
        {
          name: family,
          weight,
          style: "normal",
          data: await readFile(resolve(process.cwd(), "node_modules", file)),
        },
      ],
    },
  );
  const path = [...svg.matchAll(pathPattern)].map(([, d = ""]) => d).join("");
  const box = new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><path d="${path}"/></svg>`,
  ).getBBox();
  if (!path || !box) {
    throw new Error(`Favicon: ${family} has no outline for "${text}"`);
  }

  const { size, fit } = favicon;
  const scale = Math.min(
    (size * fit.width) / box.width,
    (size * fit.height) / box.height,
  );
  const offsetX = size / 2 - (box.x + box.width / 2) * scale;
  const offsetY = size / 2 - (box.y + box.height / 2) * scale;

  return [...path.matchAll(commandPattern)]
    .map(([, command = "", args = ""]) => {
      const points = (args.match(numberPattern) ?? []).map((value, index) =>
        round(Number(value) * scale + (index % 2 === 0 ? offsetX : offsetY)),
      );
      return `${command}${points.join(" ")}`;
    })
    .join("");
}

function outline(): Promise<string> {
  outlineCache ??= renderOutline();
  return outlineCache;
}

function frame(body: string, style = ""): string {
  const { size } = favicon;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${style}${body}</svg>`;
}

export async function themedIconSvg(): Promise<string> {
  const { size, radius, color } = favicon;
  const style = `<style>.tile{fill:${color.light.tile}}.text{fill:${color.light.text}}@media (prefers-color-scheme:dark){.tile{fill:${color.dark.tile}}.text{fill:${color.dark.text}}}</style>`;
  return frame(
    `<rect class="tile" width="${size}" height="${size}" rx="${radius}"/><path class="text" d="${await outline()}"/>`,
    style,
  );
}

export async function iconSvg(scheme: Scheme, rounded = true): Promise<string> {
  const { size, radius, color } = favicon;
  return frame(
    `<rect fill="${color[scheme].tile}" width="${size}" height="${size}"${rounded ? ` rx="${radius}"` : ""}/><path fill="${color[scheme].text}" d="${await outline()}"/>`,
  );
}

export async function iconPng(
  scheme: Scheme,
  width: number,
  rounded = true,
): Promise<Buffer> {
  return new Resvg(await iconSvg(scheme, rounded), {
    fitTo: { mode: "width", value: width },
  })
    .render()
    .asPng();
}

export async function iconIco(): Promise<Buffer> {
  const sizes = favicon.icoSizes;
  const images = await Promise.all(sizes.map((size) => iconPng("light", size)));
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((image, index) => {
    const entry = 6 + 16 * index;
    const size = sizes[index] ?? 0;
    header.writeUInt8(size, entry);
    header.writeUInt8(size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(image.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });
  return Buffer.concat([header, ...images]);
}
