import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { execSync } from 'node:child_process'

function getAppVersion(): string {
  try {
    return execSync('node scripts/version.mjs', { encoding: 'utf8' }).trim()
  } catch {
    return '1.0.0'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(getAppVersion()),
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("radix-ui")) return "radix-vendor";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("react-router")) return "react-router-vendor";
          if (
            id.includes("react-dom") ||
            id.includes("/react/") ||
            id.includes("scheduler")
          ) {
            return "react-vendor";
          }
          return undefined;
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      ignored: ["**/src/data/**"],
    },
  },
})
