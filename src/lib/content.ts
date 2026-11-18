import { getCollection, getEntry, type CollectionEntry } from "astro:content";

export type Page = CollectionEntry<"pages">;
export type Post = CollectionEntry<"posts">;
export type Project = CollectionEntry<"projects">;
export type Bookmark = CollectionEntry<"bookmarks">;
export type Experience = CollectionEntry<"experience">;
export type ResumeSection = CollectionEntry<"resume">;

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

function byTime(a: Project, b: Project): number {
  return (
    b.data.year - a.data.year ||
    b.data.impact - a.data.impact ||
    a.data.title.localeCompare(b.data.title)
  );
}

function byImpact(a: Project, b: Project): number {
  return b.data.impact - a.data.impact || byTime(a, b);
}

export function isPublished(project: Project): boolean {
  return import.meta.env.SHOW_DRAFTS || project.data.published;
}

export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection("projects", isPublished);
  return projects.sort(byTime);
}

export async function getProjectsByImpact(): Promise<Project[]> {
  const projects = await getCollection("projects", isPublished);
  return projects.sort(byImpact);
}

export function timeRanks(projects: Project[]): Map<string, number> {
  return new Map(
    [...projects].sort(byTime).map((project, index) => [project.id, index]),
  );
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const bookmarks = await getCollection("bookmarks");
  return bookmarks.sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

function endTime(entry: Experience): number {
  return entry.data.end?.valueOf() ?? Number.POSITIVE_INFINITY;
}

export async function getExperience(): Promise<Experience[]> {
  const entries = await getCollection("experience");
  return entries.sort(
    (a, b) =>
      endTime(b) - endTime(a) ||
      b.data.start.valueOf() - a.data.start.valueOf(),
  );
}

export async function getResumeSections(): Promise<ResumeSection[]> {
  const sections = await getCollection("resume");
  return sections.sort((a, b) => a.data.order - b.data.order);
}
