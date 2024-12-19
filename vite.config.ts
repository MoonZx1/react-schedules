import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false, // ปิด overlay หากต้องการ
    },
  },
});
