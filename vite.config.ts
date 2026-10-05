import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

// The UI calls Mira directly (VITE_MIRA_URL, see src/mirror/fetchJson.ts); Mira allows this origin via CORS.
export default defineConfig({
  server: { host: "127.0.0.1", port: 8080 },
  preview: { host: "127.0.0.1", port: 8080 },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
