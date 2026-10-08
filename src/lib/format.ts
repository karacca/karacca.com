import { site } from "@/site.config";

const monthFormat = new Intl.DateTimeFormat(site.monthLocale, {
  month: "short",
  timeZone: "UTC",
});

const numberFormat = new Intl.NumberFormat(site.dateLocale);

export function formatMonth(date: Date): string {
  return monthFormat.format(date);
}

export function formatDate(date: Date): string {
  return `${date.getUTCDate()}\u00a0${formatMonth(date)}\u00a0${date.getUTCFullYear()}`;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function domainOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
