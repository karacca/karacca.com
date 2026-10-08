import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import type { AstroIntegration } from "astro";
import { defineConfig } from "astro/config";
import { codeContrast } from "./src/lib/code-contrast";
import { site } from "./src/site.config";
import { code } from "./src/styles/tokens/code";
import { fonts } from "./src/styles/tokens/fonts";

interface Anchor {
  properties: Record<string, unknown>;
}

interface AnchorContext {
  setProperty(node: Anchor, key: string, value: string): void;
}

const filePattern = /\.(?:xml|pdf)$/i;

const filePrefetch = {
  name: "file-prefetch",
  element: {
    filter: ["a"],
    visit(node: Anchor, context: AnchorContext) {
      const { href } = node.properties;
      if (typeof href === "string" && filePattern.test(href)) {
        context.setProperty(node, "data-astro-prefetch", "false");
      }
    },
  },
};

const markdownLinks: AstroIntegration = {
  name: "markdown-links",
  hooks: {
    "astro:config:setup": ({ config }) => {
      const { name, options } = config.markdown.processor;
      const plugins = (options as { hastPlugins?: unknown }).hastPlugins;
      if (!Array.isArray(plugins)) {
        throw new Error(
          `The "${name}" Markdown processor does not accept hast plugins`,
        );
      }
      plugins.push(filePrefetch);
    },
  },
};

const drafts: AstroIntegration = {
  name: "drafts",
  hooks: {
    "astro:config:setup": ({ command, updateConfig }) => {
      updateConfig({
        vite: {
          define: {
            "import.meta.env.SHOW_DRAFTS": JSON.stringify(command === "dev"),
          },
        },
      });
    },
  },
};

export default defineConfig({
  site: site.url,
  output: "static",
  trailingSlash: "never",
  build: {
    format: "file",
    inlineStylesheets: "always",
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  fonts,
  markdown: {
    shikiConfig: {
      themes: code.themes,
      defaultColor: false,
      transformers: [codeContrast],
    },
  },
  integrations: [mdx(), sitemap(), markdownLinks, drafts],
});
