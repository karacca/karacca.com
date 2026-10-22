import type { APIRoute } from "astro";
import { iconPng } from "@/lib/favicon";
import { favicon } from "@/styles/tokens/favicon";

export const GET: APIRoute = async () =>
  new Response(
    new Uint8Array(await iconPng("light", favicon.touchSize, false)),
    { headers: { "Content-Type": "image/png" } },
  );
