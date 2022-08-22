import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify/functions";

import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  site: "https://astro-moon-landing.netlify.app/",
  integrations: [tailwind(), react(), image()],
  output: "server",
  adapter: netlify(),
  vite: {
    ssr: {
      external: ["@11ty/eleventy-img"],
    },
  },
});
