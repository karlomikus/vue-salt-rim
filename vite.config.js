import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

const manifest = {
  name: 'Salt Rim for Bar Assistant',
  short_name: 'Salt Rim',
  description: 'Bar assistant is a self hosted application for managing your home bar.',
  theme_color: '#737db7',
  icons: [
    {
      src: 'pwa-192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: 'pwa-512.png',
      sizes: '512x512',
      type: 'image/png'
    }
  ]
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), VitePWA({
    manifest: manifest
  })],
  envDir: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
