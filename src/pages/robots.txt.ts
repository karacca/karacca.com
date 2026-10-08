import type { APIRoute } from "astro";
import { site } from "@/site.config";

export const GET: APIRoute = (context) =>
  new Response(
    [
      "User-agent: *",
      "Allow: /",
      "",
      `Sitemap: ${new URL("/sitemap-index.xml", context.site ?? site.url).href}`,
      "",
    ].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
