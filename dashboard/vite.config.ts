import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { execSync } from 'node:child_process'

function getAppVersion(): string {
  try {
    const messages = execSync('git log --reverse --format=%s')
      .toString()
      .trim()
      .split('\n')
      .filter(Boolean)
    const isComplex = (msg: string) => /^(feat|perf)(\(.+\))?:/.test(msg)
    let minor = 0
    let patch = 0
    messages.slice(1).forEach((msg) => {
      if (isComplex(msg)) {
        minor += 1
        patch = 0
      } else {
        patch += 1
      }
    })
    return `1.${minor}.${patch}`
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
  },
})
