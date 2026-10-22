import type { APIRoute } from "astro";
import { themedIconSvg } from "@/lib/favicon";

export const GET: APIRoute = async () =>
  new Response(await themedIconSvg(), {
    headers: { "Content-Type": "image/svg+xml" },
  });
