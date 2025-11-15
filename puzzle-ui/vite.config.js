import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176, // or whatever you're using
    proxy: {
      // Anything starting with /api gets proxied to Spring Boot
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
