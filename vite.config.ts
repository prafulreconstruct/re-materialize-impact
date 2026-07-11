import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [viteReact(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      "@tanstack/react-router": "/src/lib/router-compat.tsx",
    },
  },
  server: {
    port: 8080,
    strictPort: true,
  },
});
