import { site } from "@/site.config";

export function pageTitle(title: string, isHome = false): string {
  return isHome ? title : site.titleTemplate.replace("%s", title);
}

export function cleanPath(pathname: string): string {
  const path = pathname
    .replace(/\.html$/, "")
    .replace(/\/index$/, "")
    .replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

function ogSlug(pathname: string): string {
  const slug = cleanPath(pathname).replace(/^\/+/, "");
  return slug === "" ? "home" : slug;
}

export function ogImagePath(pathname: string): string {
  return `/og/${ogSlug(pathname)}.png`;
}

export function currentState(
  href: string,
  pathname: string,
): "page" | "true" | undefined {
  const current = cleanPath(pathname);
  if (current === href) {
    return "page";
  }
  return current.startsWith(`${href}/`) ? "true" : undefined;
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}
