import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import type { AstroIntegration } from "astro";
import { defineConfig, sharpImageService } from "astro/config";
import { codeContrast } from "./src/lib/code-contrast";
import { site } from "./src/site.config";
import { code } from "./src/styles/tokens/code";
import { fonts } from "./src/styles/tokens/fonts";
import { image } from "./src/styles/tokens/image";

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

const devPages: AstroIntegration = {
  name: "dev-pages",
  hooks: {
    "astro:config:setup": ({ command, injectRoute }) => {
      if (command === "dev") {
        injectRoute({
          pattern: "/components",
          entrypoint: "./src/dev/components.astro",
        });
      }
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
  image: {
    service: sharpImageService({ webp: { ...image.webp } }),
  },
  markdown: {
    shikiConfig: {
      themes: code.themes,
      defaultColor: false,
      transformers: [codeContrast],
    },
  },
  integrations: [mdx(), sitemap(), markdownLinks, drafts, devPages],
});
