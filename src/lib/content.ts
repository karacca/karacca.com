import { getCollection, getEntry, type CollectionEntry } from "astro:content";

export type Page = CollectionEntry<"pages">;
export type Post = CollectionEntry<"posts">;
export type Project = CollectionEntry<"projects">;
export type Bookmark = CollectionEntry<"bookmarks">;

export async function getPage(id: string): Promise<Page> {
  const page = await getEntry("pages", id);
  if (!page) {
    throw new Error(`Missing page content: src/content/pages/${id}`);
  }
  return page;
}

export function label(page: Page, key: string): string {
  const value = page.data.labels[key];
  if (value === undefined) {
    throw new Error(`Missing label "${key}" in src/content/pages/${page.id}`);
  }
  return value;
}

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection(
    "posts",
    ({ data }) => import.meta.env.SHOW_DRAFTS || !data.draft,
  );
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

function latestYear({ data }: Project): number {
  if (data.end === "present") {
    return Number.POSITIVE_INFINITY;
  }
  return data.end ?? data.start;
}

function byTime(a: Project, b: Project): number {
  return (
    latestYear(b) - latestYear(a) ||
    b.data.start - a.data.start ||
    b.data.impact - a.data.impact ||
    a.data.title.localeCompare(b.data.title)
  );
}

function byImpact(a: Project, b: Project): number {
  return b.data.impact - a.data.impact || byTime(a, b);
}

export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection("projects");
  return projects.sort(byTime);
}

export function impactRanks(projects: Project[]): Map<string, number> {
  return new Map(
    [...projects].sort(byImpact).map((project, index) => [project.id, index]),
  );
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const bookmarks = await getCollection("bookmarks");
  return bookmarks.sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}
