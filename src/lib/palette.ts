import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export type Scheme = "light" | "dark";

type Oklch = [lightness: number, chroma: number, hue: number];

const source = "src/styles/tokens/color.css";
const declarationPattern = /(--[\w-]+)\s*:\s*([^;{}]+);/g;
const commentPattern = /\/\*[\s\S]*?\*\//g;

let declarations: Map<string, string> | undefined;

function fail(token: string, reason: string): never {
  throw new Error(`Cannot resolve ${token} from ${source}: ${reason}`);
}

function lookup(name: string, token: string): string {
  declarations ??= new Map(
    [
      ...readFileSync(resolve(process.cwd(), source), "utf8")
        .replace(commentPattern, "")
        .matchAll(declarationPattern),
    ].map(([, property = "", value = ""]) => [property, value.trim()]),
  );
  return declarations.get(name) ?? fail(token, `${name} is not defined`);
}

function split(value: string, separator: RegExp): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const character of value) {
    if (character === "(") {
      depth += 1;
    }
    if (character === ")") {
      depth -= 1;
    }
    if (depth === 0 && separator.test(character)) {
      parts.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  return [...parts, current].map((part) => part.trim()).filter(Boolean);
}

function unwrap(value: string, name: string): string | undefined {
  const [only, ...rest] = split(value, /\s/);
  return rest.length === 0 && only?.startsWith(`${name}(`) && only.endsWith(")")
    ? only.slice(name.length + 1, -1).trim()
    : undefined;
}

function number(expression: string, token: string): number {
  const reference = unwrap(expression, "var");
  if (reference !== undefined) {
    return number(lookup(reference, token), token);
  }
  const product = unwrap(expression, "calc");
  if (product !== undefined) {
    return split(product, /\*/).reduce(
      (result, factor) => result * number(factor, token),
      1,
    );
  }
  const value = expression.trim();
  const parsed = Number(value);
  return value !== "" && Number.isFinite(parsed)
    ? parsed
    : fail(token, `"${value}" is not a number`);
}

function oklch(
  value: string,
  scheme: Scheme | undefined,
  token: string,
): Oklch {
  const reference = unwrap(value, "var");
  if (reference !== undefined) {
    return oklch(lookup(reference, token), scheme, token);
  }
  const schemes = unwrap(value, "light-dark");
  if (schemes !== undefined) {
    const [light, dark, ...rest] = split(schemes, /,/);
    if (light === undefined || dark === undefined || rest.length > 0) {
      return fail(token, `"${value}" needs two colors`);
    }
    if (scheme === undefined) {
      return fail(token, `"${value}" needs a color scheme`);
    }
    return oklch(scheme === "light" ? light : dark, scheme, token);
  }
  const components = unwrap(value, "oklch");
  if (components === undefined) {
    return fail(token, `"${value}" is not an oklch() color`);
  }
  const [lightness, chroma, hue, ...rest] = split(components, /\s/);
  if (
    lightness === undefined ||
    chroma === undefined ||
    hue === undefined ||
    rest.length > 0
  ) {
    return fail(token, `"${value}" needs lightness, chroma and hue`);
  }
  return [number(lightness, token), number(chroma, token), number(hue, token)];
}

function toGamma(value: number): number {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped <= 0.0031308
    ? clamped * 12.92
    : 1.055 * clamped ** (1 / 2.4) - 0.055;
}

function toHex([lightness, chroma, hue]: Oklch): string {
  const angle = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(angle);
  const b = chroma * Math.sin(angle);
  const long = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const medium = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const short = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return `#${[
    4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
    -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
    -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
  ]
    .map((channel) =>
      Math.round(toGamma(channel) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

export function palette(token: string, scheme?: Scheme): string {
  return toHex(oklch(`var(${token})`, scheme, token));
}
