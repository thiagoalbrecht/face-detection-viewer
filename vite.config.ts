import { defineConfig, normalizePath } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.join(__dirname, 'node_modules', 'mediainfo.js', 'dist', 'MediaInfoModule.wasm')),
          dest: '',
        },
      ],
    }),
  ],
})
