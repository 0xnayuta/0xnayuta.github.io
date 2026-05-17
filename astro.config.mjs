// @ts-check
import { defineConfig, envField } from "astro/config";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import remarkToc from "remark-toc";
import remarkCollapseToc from "./src/utils/remark/remark-collapse-toc";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./src/config";

// https://astro.build/config
export default defineConfig({
  site: config.site.url,
  i18n: {
    defaultLocale: config.site.lang,
    locales: [config.site.lang],
  },
  integrations: [
    sitemap({
      filter: (page) => config.features.showArchives || !page.endsWith("/archives"),
    }),
  ],
  markdown: {
    remarkPlugins: [
      remarkToc,
      [remarkCollapseToc, { test: "Table of contents" }],
    ],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    // eslint-disable-next-line
    // @ts-ignore
    // This will be fixed in Astro 6 with Vite 7 support
    // See: https://github.com/withastro/astro/issues/14030
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
});
