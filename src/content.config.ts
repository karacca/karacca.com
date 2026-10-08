import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { parse } from "yaml";

const date = z.union([z.date(), z.iso.date()]).pipe(z.coerce.date());

const pages = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.strictObject({
    title: z.string(),
    description: z.string(),
    heading: z.string().optional(),
    labels: z.record(z.string(), z.string()).default({}),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.strictObject({
    title: z.string(),
    description: z.string(),
    date,
    updated: date.optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.strictObject({
    title: z.string(),
    description: z.string(),
    year: z.number().int(),
    company: z.string().optional(),
    links: z
      .strictObject({
        website: z.url().optional(),
        appStore: z.url().optional(),
        googlePlay: z.url().optional(),
      })
      .default({}),
    status: z.string().optional(),
    detail: z.boolean().default(false),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const bookmarks = defineCollection({
  loader: file("./src/content/bookmarks.yaml", {
    parser: (text) =>
      ((parse(text) ?? []) as (Record<string, unknown> | null)[]).map(
        (bookmark, index) => ({
          ...bookmark,
          id: `${index}-${String(bookmark?.url ?? "missing")}`,
        }),
      ),
  }),
  schema: z.strictObject({
    id: z.string(),
    title: z.string(),
    url: z.url(),
    description: z.string().optional(),
    date,
  }),
});

export const collections = { pages, posts, projects, bookmarks };
