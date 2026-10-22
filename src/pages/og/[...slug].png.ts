import type { APIRoute, GetStaticPaths, ImageMetadata } from "astro";
import { getCollection } from "astro:content";
import { getPosts, getProjects } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { getContributions } from "@/lib/github";
import { renderOgImage, type OgImage } from "@/lib/og-image";
import { site } from "@/site.config";

const excludedPages = new Set(["404"]);
const chartPage = "home";

function titled(title: string, description: string) {
  return description === title ? { title } : { title, description };
}

function filePath(image: ImageMetadata): string {
  const { fsPath } = image as ImageMetadata & { fsPath?: string };
  if (!fsPath) {
    throw new Error(`No file path for image ${image.src}`);
  }
  return fsPath;
}

export const getStaticPaths = (async () => {
  const pages = await getCollection(
    "pages",
    ({ id }) => !excludedPages.has(id),
  );
  const posts = await getPosts();
  const projects = await getProjects();
  const { weeks } = await getContributions();

  return [
    ...pages.map(({ id, data }) => {
      const title =
        data.title === site.name
          ? (data.heading ?? data.description)
          : data.title;
      return {
        params: { slug: id },
        props:
          id === chartPage
            ? { title, chart: weeks }
            : titled(title, data.description),
      };
    }),
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
          ...(data.icon ? { icon: filePath(data.icon.src) } : {}),
        },
      })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute<OgImage> = async ({ props, params }) =>
  new Response(await renderOgImage(props, params.slug ?? ""), {
    headers: { "Content-Type": "image/png" },
  });
