import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: Number(env.VITE_PORT) || 7445,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tabs',
              '@radix-ui/react-select',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-popover',
              '@radix-ui/react-tooltip',
            ],
            'vendor-table': ['@tanstack/react-table'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-graphql': ['@apollo/client', 'graphql'],
            'vendor-charts': ['recharts'],
            'vendor-form': ['react-hook-form', 'zod', '@hookform/resolvers'],
            'vendor-date': ['date-fns'],
            'vendor-map': ['leaflet', 'react-leaflet'],
          },
        },
      },
    },
  }
})
