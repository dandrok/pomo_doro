import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@screens": path.resolve(import.meta.dirname, "./src/components/screens"),
      "@ui": path.resolve(import.meta.dirname, "./src/components/ui"),
      "@hooks": path.resolve(import.meta.dirname, "./src/hooks"),
      "@utils": path.resolve(import.meta.dirname, "./src/utils"),
      "@types": path.resolve(import.meta.dirname, "./src/types"),
    },
  },
});
