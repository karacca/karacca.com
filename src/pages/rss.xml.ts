import { getContainerRenderer } from "@astrojs/mdx/container-renderer";
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { render } from "astro:content";
import Chip from "@/components/Chip.astro";
import { getPage, getPosts } from "@/lib/content";
import { site } from "@/site.config";

const iconPattern = /<svg\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/svg>/gi;
const tagPattern = /<[a-z][^>]*>/gi;
const attributePattern = /\s([\w:-]+)(?:="[^"]*")?/g;
const noisePattern = /^(?:data-astro-|style$|tabindex$)/;
const urlPattern = /\s(href|src)="(\/(?!\/)[^"]*|#[^"]*)"/g;

function feedHtml(html: string, base: URL): string {
  return html
    .replace(iconPattern, "")
    .replace(tagPattern, (tag) =>
      tag
        .replace(attributePattern, (attribute, name: string) =>
          noisePattern.test(name) ? "" : attribute,
        )
        .replace(
          urlPattern,
          (_, name: string, value: string) =>
            ` ${name}="${new URL(value, base).href}"`,
        ),
    )
    .trim();
}

export const GET: APIRoute = async (context) => {
  const origin = context.site ?? new URL(site.url);
  const page = await getPage("writing");
  const posts = (await getPosts()).filter((post) => !post.data.draft);
  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });

  const items = await Promise.all(
    posts.map(async (post) => {
      const link = new URL(`/writing/${post.id}`, origin);
      const { Content } = await render(post);
      const html = await container.renderToString(Content, {
        props: { components: { Chip } },
      });
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: link.href,
        content: feedHtml(html, link),
      };
    }),
  );

  return rss({
    title: site.name,
    description: page.data.description,
    site: origin,
    trailingSlash: false,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: [
      `<language>${site.language}</language>`,
      `<atom:link href="${new URL(site.rss.href, origin).href}" rel="self" type="application/rss+xml"/>`,
    ].join(""),
    items,
  });
};
