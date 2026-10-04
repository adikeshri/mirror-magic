import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { createApi } from "./server/api.ts";

// Mounts the same /api routes the production server uses (server/index.ts),
// so dev, preview and prod behave identically.
function mirrorApi(): Plugin {
  const api = createApi(path.resolve(process.env.MIRROR_CONFIG ?? "config.json"));
  return {
    name: "mirror-api",
    configureServer: (server) => void server.middlewares.use(api),
    configurePreviewServer: (server) => void server.middlewares.use(api),
  };
}

export default defineConfig({
  server: { host: "127.0.0.1", port: 8080 },
  preview: { host: "127.0.0.1", port: 8080 },
  plugins: [react(), mirrorApi()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
