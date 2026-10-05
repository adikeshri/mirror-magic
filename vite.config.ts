import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

// Dev and preview forward /api to Mira, as the production server does (server/proxy.ts).
const mira = { "/api": process.env.MIRA_URL ?? "http://127.0.0.1:5080" };

export default defineConfig({
  server: { host: "127.0.0.1", port: 8080, proxy: mira },
  preview: { host: "127.0.0.1", port: 8080, proxy: mira },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
