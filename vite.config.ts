import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // primevue/firebase bilinçli olarak tek vendor chunk'ında toplandı.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Nadiren değişen büyük bağımlılıkları ayrı tutarak tarayıcı
        // önbelleğini iyileştir (uygulama kodu değişince yeniden inmesin).
        manualChunks(id) {
          if (id.includes("node_modules/firebase") || id.includes("node_modules/@firebase"))
            return "firebase";
          if (id.includes("node_modules/primevue") || id.includes("node_modules/@primevue"))
            return "primevue";
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
});
