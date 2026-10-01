import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  // Относительные пути: сборка работает из любой папки — GitHub Pages, Beget, подпапка сайта
  base: "./",
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        teplo: resolve(import.meta.dirname, "teplo/index.html"),
      },
    },
  },
});
