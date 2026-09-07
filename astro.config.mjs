import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import { features, mdastPlugins, hastPlugins } from "./src/lib/markdown/index.ts";
import { flexokiLight, flexokiDark } from "./src/lib/shiki-flexoki.ts";

export default defineConfig({
  site: "https://www.bcardiff.com",
  markdown: {
    processor: satteri({ features, mdastPlugins, hastPlugins }),
    shikiConfig: {
      themes: { light: flexokiLight, dark: flexokiDark },
      defaultColor: false,
    },
  },
});
