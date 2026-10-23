import { defineCollection, type SchemaContext } from "astro:content";
import { file, glob, type Loader } from "astro/loaders";
import { z } from "astro/zod";
import { parse } from "yaml";

const date = z.union([z.date(), z.iso.date()]).pipe(z.coerce.date());

function hideUnpublished(loader: Loader): Loader {
  return {
    ...loader,
    load: async (context) => {
      await loader.load(context);
      if (import.meta.env.SHOW_DRAFTS) {
        return;
      }
      for (const { id, data } of context.store.values()) {
        if (data.published === false) {
          context.store.set({
            id,
            data: { title: data.title, published: false },
          });
        }
      }
    },
  };
}

function shot(image: SchemaContext["image"]) {
  return z.strictObject({
    src: image(),
    dark: image().optional(),
    alt: z.string(),
    caption: z.string().optional(),
  });
}

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
    lang: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: hideUnpublished(
    glob({ pattern: "*.{md,mdx}", base: "./src/content/projects" }),
  ),
  schema: ({ image }) =>
    z.strictObject({
      title: z.string(),
      description: z.string(),
      year: z.number().int(),
      company: z.string().optional(),
      role: z.string().optional(),
      highlights: z
        .array(
          z.strictObject({
            value: z.union([z.string(), z.number()]),
            label: z.string(),
          }),
        )
        .max(4)
        .default([]),
      links: z
        .strictObject({
          website: z.url().optional(),
          appStore: z.url().optional(),
          googlePlay: z.url().optional(),
          github: z.url().optional(),
        })
        .default({}),
      status: z.string().optional(),
      impact: z.number().int().min(1).max(10).default(1),
      icon: z
        .strictObject({ src: image(), dark: image().optional() })
        .optional(),
      gallery: z.array(shot(image)).default([]),
      screens: z.array(shot(image)).default([]),
      published: z.boolean().default(true),
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
