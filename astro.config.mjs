// @ts-check
import { defineConfig } from "astro/config";
import { markdown } from "./src/markdown.mts";
// https://astro.build/config
export default defineConfig({
  markdown,
  trailingSlash: "always",
  vite: {
    server: {
      allowedHosts: ["internal-dev.50512.dev", "localhost"],
    },
  },
});
