import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { getPosts, getProjects } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { renderOgImage, type OgImage } from "@/lib/og-image";
import { site } from "@/site.config";

const excludedPages = new Set(["404"]);

function titled(title: string, description: string) {
  return description === title ? { title } : { title, description };
}

export const getStaticPaths = (async () => {
  const pages = await getCollection(
    "pages",
    ({ id }) => !excludedPages.has(id),
  );
  const posts = await getPosts();
  const projects = await getProjects();

  return [
    ...pages.map(({ id, data }) => ({
      params: { slug: id },
      props: titled(
        data.title === site.name
          ? (data.heading ?? data.description)
          : data.title,
        data.description,
      ),
    })),
    ...posts.map(({ id, data }) => ({
      params: { slug: `writing/${id}` },
      props: {
        ...titled(data.title, data.description),
        meta: [formatDate(data.date)],
      },
    })),
    ...projects
      .filter(({ data }) => data.detail)
      .map(({ id, data }) => ({
        params: { slug: `projects/${id}` },
        props: {
          ...titled(data.title, data.description),
          meta: [String(data.year), ...(data.company ? [data.company] : [])],
        },
      })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute<OgImage> = async ({ props, params }) =>
  new Response(await renderOgImage(props, params.slug ?? ""), {
    headers: { "Content-Type": "image/png" },
  });
