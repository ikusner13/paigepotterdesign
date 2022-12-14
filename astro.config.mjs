import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import image from "@astrojs/image";
// import netlify from "@astrojs/netlify/functions";

// https://astro.build/config
export default defineConfig({
  site: "https://ubiquitous-pony-627bfd.netlify.app/",
  integrations: [tailwind(), react(), image()],
  // output: "server",
  // adapter: netlify(),
  vite: {
    ssr: {
      external: ["@11ty/eleventy-img, svgo"],
    },
  },
});
