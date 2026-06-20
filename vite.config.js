import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      injectRegister: false,
      manifest: false,
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
      },
    }),
  ],
});
