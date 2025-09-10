import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: "127.0.0.1",
    allowedHosts: ["admin.test.communistmuseum.org"], // allow this host
    proxy: {
      "/api": {
        target: "https://backend.test.communistmuseum.org",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
