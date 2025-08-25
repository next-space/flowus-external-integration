import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const baseUrl = "https://api.flowus.cn";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/oauth/token": {
        target: baseUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/oauth\/token/, "/oauth/token"),
      },
      "/v1/pages": {
        target: baseUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/v1\/pages/, "/v1/pages"),
      },
      "/v1/blocks": {
        target: baseUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/v1\/blocks/, "/v1/blocks"),
      },
    },
  },
});
