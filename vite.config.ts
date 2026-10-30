// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Esto es útil para que Vite reconozca las rutas de tu nueva estructura
  resolve: {
    alias: {
      "@": "/src",
      "@core": "/src/core",
      "@infra": "/src/infraestructure",
      "@ui": "/src/ui",
      "@adapters": "/src/adapters",
    },
  },
});
