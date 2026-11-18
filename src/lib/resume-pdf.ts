import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { ElementContent, RootContent } from "hast";
import { fromHtml } from "hast-util-from-html";
import PDFDocument from "pdfkit";
import { site } from "@/site.config";
import { pdf } from "@/styles/tokens/pdf";

export interface ResumeContact {
  text: string;
  href: string;
}

export interface ResumeEntry {
  role: string;
  dates: string;
  company: string;
  companyUrl?: string;
  details: string;
  html: string;
}

export interface ResumeSection {
  title: string;
  html?: string;
  entries?: ResumeEntry[];
}

export interface ResumeDocument {
  title: string;
  subject: string;
  name: string;
  headline: string;
  contacts: ResumeContact[];
  separator: string;
  sections: ResumeSection[];
}

type Token = (typeof pdf.text)[keyof typeof pdf.text];

interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
  muted?: boolean;
  link?: string;
}

interface Piece {
  font: string;
  text: string;
  color: string;
  link: string | null;
}

interface Box {
  x: number;
  width: number;
}

interface LoadedFont {
  name: string;
  family: string;
  weight: number;
  data: Buffer;
  ranges: [number, number][];
}

interface FontMetrics {
  _font: { ascender: number };
}

const collapsePattern = /[ \t\n\r\f]+/g;
const blankPattern = /^[ \t\n\r\f]*$/;
const features = pdf.features as unknown as PDFKit.Mixins.OpenTypeFeatures[];

let fontCache: Promise<LoadedFont[]> | undefined;

function loadFonts(): Promise<LoadedFont[]> {
  fontCache ??= Promise.all(
    pdf.fonts.map(async ({ family, weight, subset, file, ranges }) => {
      const root = resolve(process.cwd(), "node_modules");
      const table = JSON.parse(
        await readFile(resolve(root, ranges), "utf8"),
      ) as Record<string, string | undefined>;
      const list = table[subset];
      if (list === undefined) {
        throw new Error(`Missing subset "${subset}" in ${ranges}`);
      }
      return {
        name: `${family}-${weight}-${subset}`,
        family,
        weight,
        data: await readFile(resolve(root, file)),
        ranges: list.split(",").map((range): [number, number] => {
          const [start = "", end = start] = range.replace("U+", "").split("-");
          return [Number.parseInt(start, 16), Number.parseInt(end, 16)];
        }),
      };
    }),
  );
  return fontCache;
}

function absolute(href: string): string {
  return new URL(href, site.url).href;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function inline(nodes: ElementContent[], style: Omit<Run, "text">): Run[] {
  return nodes.flatMap((node): Run[] => {
    if (node.type === "text") {
      return [{ ...style, text: node.value.replace(collapsePattern, " ") }];
    }
    if (node.type === "comment") {
      return [];
    }
    switch (node.tagName) {
      case "strong":
      case "b":
        return inline(node.children, { ...style, bold: true });
      case "em":
      case "i":
        return inline(node.children, { ...style, italic: true });
      case "a": {
        const href = node.properties.href;
        if (typeof href !== "string") {
          throw new Error("Resume PDF: a link has no href");
        }
        return inline(node.children, { ...style, link: absolute(href) });
      }
      case "span":
        return inline(node.children, style);
      default:
        throw new Error(
          `Resume PDF: <${node.tagName}> is not supported inside text`,
        );
    }
  });
}

function trim(runs: Run[]): Run[] {
  const trimmed = runs.map((run) => ({ ...run }));
  const first = trimmed[0];
  const last = trimmed.at(-1);
  if (first) {
    first.text = first.text.trimStart();
  }
  if (last) {
    last.text = last.text.trimEnd();
  }
  return trimmed.filter((run) => run.text !== "");
}

export async function renderResumePdf(resume: ResumeDocument): Promise<Buffer> {
  const fonts = await loadFonts();
  const { margins } = pdf.page;

  const doc = new PDFDocument({
    size: pdf.page.size,
    margins,
    lang: site.language,
    displayTitle: true,
    info: {
      Title: resume.title,
      Author: resume.name,
      Subject: resume.subject,
    },
  });

  for (const font of fonts) {
    doc.registerFont(font.name, font.data);
  }

  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolveDone, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolveDone(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const left = margins.left;
  const contentWidth = doc.page.width - margins.left - margins.right;
  const full: Box = { x: left, width: contentWidth };

  function fontFor(family: string, weight: number, point: number): string {
    const match = fonts.find(
      (font) =>
        font.family === family &&
        font.weight === weight &&
        font.ranges.some(([start, end]) => point >= start && point <= end),
    );
    if (!match) {
      const code = point.toString(16).toUpperCase().padStart(4, "0");
      throw new Error(
        `Resume PDF: "${String.fromCodePoint(point)}" (U+${code}) is not covered by the ${family} ${weight} fonts in src/styles/tokens/pdf.ts`,
      );
    }
    return match.name;
  }

  function primary(token: Token, run: Partial<Run> = {}): string {
    return fontFor(family(token, run), weight(token, run), 0x41);
  }

  function family(token: Token, run: Partial<Run>): string {
    return run.italic && token.family === "sans" ? "sans-italic" : token.family;
  }

  function weight(token: Token, run: Partial<Run>): number {
    return run.bold ? pdf.strong : token.weight;
  }

  function pieces(runs: Run[], token: Token): Piece[] {
    const result: Piece[] = [];
    for (const run of runs) {
      const color = run.muted ? pdf.color.textMuted : pdf.color.text;
      const link = run.link ?? null;
      for (const character of run.text) {
        const font = fontFor(
          family(token, run),
          weight(token, run),
          character.codePointAt(0) ?? 0,
        );
        const last = result.at(-1);
        if (
          last &&
          last.font === font &&
          last.color === color &&
          last.link === link
        ) {
          last.text += character;
        } else {
          result.push({ font, text: character, color, link });
        }
      }
    }
    return result;
  }

  function lineHeight(token: Token): number {
    return token.size * token.leading;
  }

  function lineGap(token: Token): number {
    doc.font(primary(token)).fontSize(token.size);
    return lineHeight(token) - doc.currentLineHeight(true);
  }

  function ascent(token: Token): number {
    doc.font(primary(token)).fontSize(token.size);
    return ((doc as unknown as FontMetrics)._font.ascender / 1000) * token.size;
  }

  function measure(runs: Run[], token: Token): number {
    return pieces(runs, token).reduce((width, piece) => {
      doc.font(piece.font).fontSize(token.size);
      return width + doc.widthOfString(piece.text, { features });
    }, 0);
  }

  function ensure(height: number): void {
    if (doc.y + height > doc.page.height - margins.bottom) {
      doc.addPage();
    }
  }

  function write(
    runs: Run[],
    token: Token,
    box: Box,
    options: { y?: number; lineBreak?: boolean } = {},
  ): void {
    const parts = pieces(trim(runs), token);
    const gap = lineGap(token);
    parts.forEach((part, index) => {
      doc.font(part.font).fontSize(token.size).fillColor(part.color);
      const textOptions: PDFKit.Mixins.TextOptions = {
        width: box.width,
        lineGap: gap,
        features,
        link: part.link,
        continued: index < parts.length - 1,
        ...(options.lineBreak === false ? { lineBreak: false } : {}),
      };
      if (index === 0) {
        doc.text(part.text, box.x, options.y ?? doc.y, textOptions);
      } else {
        doc.text(part.text, textOptions);
      }
    });
    doc.x = left;
  }

  function blocks(nodes: RootContent[] | ElementContent[], box: Box): void {
    const token = pdf.text.body;
    let first = true;
    for (const node of nodes) {
      if (node.type === "text" && blankPattern.test(node.value)) {
        continue;
      }
      if (node.type === "comment" || node.type === "doctype") {
        continue;
      }
      if (node.type !== "element") {
        throw new Error(`Resume PDF: unexpected ${node.type} between blocks`);
      }
      if (!first) {
        doc.y += pdf.space.block;
      }
      first = false;
      switch (node.tagName) {
        case "p":
          ensure(lineHeight(token));
          write(inline(node.children, {}), token, box);
          break;
        case "ul":
        case "ol": {
          const items = node.children.filter(
            (child) => child.type === "element" && child.tagName === "li",
          );
          items.forEach((item, index) => {
            if (item.type !== "element") {
              return;
            }
            if (index > 0) {
              doc.y += pdf.space.item;
            }
            ensure(lineHeight(token));
            const top = doc.y;
            const marker = node.tagName === "ol" ? `${index + 1}.` : pdf.bullet;
            write(
              [{ text: marker, muted: true }],
              token,
              {
                x: box.x,
                width: pdf.space.bulletIndent,
              },
              { y: top, lineBreak: false },
            );
            doc.y = top;
            const body: Box = {
              x: box.x + pdf.space.bulletIndent,
              width: box.width - pdf.space.bulletIndent,
            };
            const hasBlocks = item.children.some(
              (child) =>
                child.type === "element" &&
                ["p", "ul", "ol"].includes(child.tagName),
            );
            if (hasBlocks) {
              blocks(item.children, body);
            } else {
              write(inline(item.children, {}), token, body, { y: top });
            }
          });
          break;
        }
        default:
          throw new Error(
            `Resume PDF: <${node.tagName}> is not supported as a block`,
          );
      }
    }
  }

  function html(source: string, box: Box): void {
    blocks(fromHtml(source, { fragment: true }).children, box);
  }

  function heading(title: string): void {
    const { heading: token, body } = pdf.text;
    ensure(
      lineHeight(token) +
        pdf.space.headingRule +
        pdf.space.afterHeading +
        lineHeight(pdf.text.entryRole) +
        lineHeight(body) * 2,
    );
    write([{ text: capitalize(title) }], token, full);
    const ruleY = doc.y + pdf.space.headingRule;
    doc
      .moveTo(left, ruleY)
      .lineTo(left + contentWidth, ruleY)
      .lineWidth(pdf.rule.width)
      .strokeColor(pdf.color.rule)
      .stroke();
    doc.y = ruleY + pdf.space.afterHeading;
  }

  function entry(item: ResumeEntry): void {
    const { entryRole, dates, company, body } = pdf.text;
    ensure(
      lineHeight(entryRole) +
        lineHeight(company) +
        pdf.space.afterCompany +
        lineHeight(body),
    );
    const top = doc.y;
    const datesRuns: Run[] = [{ text: item.dates, muted: true }];
    const datesWidth = measure(datesRuns, dates);
    write([{ text: item.role }], entryRole, {
      x: left,
      width: contentWidth - datesWidth - pdf.space.datesGap,
    });
    const after = doc.y;
    write(
      datesRuns,
      dates,
      { x: left + contentWidth - datesWidth, width: datesWidth + 1 },
      { y: top + ascent(entryRole) - ascent(dates), lineBreak: false },
    );
    doc.y = after;
    write(
      [
        {
          text: item.company,
          muted: true,
          ...(item.companyUrl ? { link: item.companyUrl } : {}),
        },
        { text: item.details, muted: true },
      ],
      company,
      full,
    );
    doc.y += pdf.space.afterCompany;
    html(item.html, full);
  }

  write([{ text: resume.name }], pdf.text.name, full);
  doc.y += pdf.space.afterName;
  write([{ text: resume.headline }], pdf.text.role, full);
  doc.y += pdf.space.afterRole;
  const separator: Run = { text: resume.separator, muted: true };
  const contactLines: Run[][] = [];
  for (const contact of resume.contacts) {
    const run: Run = {
      text: contact.text,
      muted: true,
      link: absolute(contact.href),
    };
    const line = contactLines.at(-1);
    if (
      line &&
      measure([...line, separator, run], pdf.text.contact) <= contentWidth
    ) {
      line.push(separator, run);
    } else {
      line?.push(separator);
      contactLines.push([run]);
    }
  }
  for (const line of contactLines) {
    write(line, pdf.text.contact, full);
  }

  for (const section of resume.sections) {
    doc.y += pdf.space.section;
    heading(section.title);
    if (section.html !== undefined) {
      html(section.html, full);
    }
    section.entries?.forEach((item, index) => {
      if (index > 0) {
        doc.y += pdf.space.entry;
      }
      entry(item);
    });
  }

  doc.end();
  return done;
}
