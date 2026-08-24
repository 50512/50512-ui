// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  trailingSlash: "always",
  vite: {
    server: {
      allowedHosts: ["internal-dev.50512.dev", "localhost"],
    },
  },
});
