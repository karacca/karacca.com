import { code } from "../styles/tokens/code";

type Mode = keyof typeof code.surface;

interface StyledNode {
  properties: Record<string, unknown>;
}

const modes = Object.keys(code.surface) as Mode[];
const colorPattern = new RegExp(
  `--shiki-(${modes.join("|")}):(#[0-9a-f]{3,8})`,
  "gi",
);

function channels(hex: string): number[] {
  const digits = hex.slice(1);
  const full =
    digits.length <= 4
      ? [...digits].map((digit) => digit + digit).join("")
      : digits;
  return [0, 2, 4, 6]
    .filter((start) => start < full.length)
    .map((start) => Number.parseInt(full.slice(start, start + 2), 16) / 255);
}

function toLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function toGamma(value: number): number {
  return value <= 0.0031308
    ? value * 12.92
    : 1.055 * value ** (1 / 2.4) - 0.055;
}

function luminance(linear: number[]): number {
  const [red = 0, green = 0, blue = 0] = linear;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function toHex(linear: number[]): string {
  return `#${linear
    .map((value) =>
      Math.round(Math.min(1, Math.max(0, toGamma(value))) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function readable(hex: string, mode: Mode): string {
  const surface = channels(code.surface[mode]);
  const [red = 0, green = 0, blue = 0, alpha = 1] = channels(hex);
  const linear = [red, green, blue].map((value, index) =>
    toLinear(value * alpha + (surface[index] ?? 0) * (1 - alpha)),
  );
  const base = luminance(surface.map(toLinear));
  const current = luminance(linear);

  if (mode === "light") {
    const limit = Math.max(0, (base + 0.05) / code.minContrast - 0.05);
    if (current <= limit) {
      return hex;
    }
    return toHex(linear.map((value) => (value * limit) / current));
  }

  const limit = Math.min(1, (base + 0.05) * code.minContrast - 0.05);
  if (current >= limit) {
    return hex;
  }
  const lift = (limit - current) / (1 - current);
  return toHex(linear.map((value) => value + (1 - value) * lift));
}

function fix(node: StyledNode): void {
  const { style } = node.properties;
  if (typeof style === "string") {
    node.properties.style = style.replace(
      colorPattern,
      (_, mode: Mode, hex: string) => `--shiki-${mode}:${readable(hex, mode)}`,
    );
  }
}

export const codeContrast = {
  name: "code-contrast",
  pre: fix,
  span: fix,
};
