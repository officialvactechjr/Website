import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vendor code is grouped so the entry chunk stays under the size warning and a
// library upgrade only invalidates its own file. Pages stay lazy-loaded on top of
// this (see src/routes/index.jsx).
const vendor = (name, pattern) => ({ name, test: pattern })

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            vendor(
              'vendor-react',
              /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            ),
            vendor('vendor-supabase', /node_modules[\\/]@supabase[\\/]/),
            vendor('vendor-query', /node_modules[\\/]@tanstack[\\/]/),
            vendor('vendor-ui', /node_modules[\\/](sonner|lucide-react|date-fns)[\\/]/),
            // Forms only: zod and friends stay out of the first paint, because
            // every page that uses them is already lazy.
            vendor('vendor-forms', /node_modules[\\/](@hookform|react-hook-form|zod)[\\/]/),
          ],
        },
      },
    },
  },
})
